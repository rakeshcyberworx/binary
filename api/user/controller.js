'use strict';

const modelName                 = 'User';
const Joi                       = require('@hapi/joi');
const { UserModel,
    CategoryModel,
    ConnectionsModel,
    OrderModel,
    OtpModel,
    SessionModel,
    ProductModel,
    ReviewModel,
    ServiceModel,
    UserPostsModel,
    NotificationModel,
    GroupModel,
    GroupRequestModel,
    StateModel,
    CartModel,
    FileModel,
    RoleModel }                 = require('@database');
const dbModels                  = require('@database');
const CONSTANT                  = require('@lib/constant');
const Auth                      = require("@middleware/authorization");
const UTILS                     = require('@lib/utils');
const ejs                       = require('ejs');
const fs                        = require('fs');
const path                      = require('path');
const moment                    = require('moment');
const mail                      = require('@lib/mailer');
const ObjectId                  = require('mongodb').ObjectId;
const FILE_UPLOAD               = require('@lib/file_upload');
const excel                     = require("exceljs");
const _                         = require('lodash');
const mqtt                      = require('@middleware/mqtt');
const bcrypt                   = require('bcrypt');
// const msg91                     = require("msg91")(process.env.MSG91_API_KEY);
const msg91                     = {};

const login = async (req, res, next) => {
    try {
        const schema = Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required()
        });
        
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        let user = await UserModel.findOne({email: req.body.email}, {password: 0});
        if (!user) return res.status(400).send({error: `User ${CONSTANT.NOT_EXISTS} ${req.body.email}`});

        let validate = await user.isValidPassword(req.body.password);
        validate = !validate ? CONSTANT.INVALID_CREDENTIALS : !user.active ? 'User'+CONSTANT.INACTIVE : null;
        if (validate) return res.status(400).send({error: validate});

        user = UTILS.cloneObject(user);
        user.token = await Auth.generateJWTToken({userId: user._id, type: modelName});

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: user
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const otpLogin = async (req, res, next) => {
    try {
        const schema = Joi.object({
            email: Joi.string().required(),
            role: Joi.string().required()
        });
        
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        const role = ((await RoleModel.findOne({$or: [{code: req.body.role.toUpperCase()}, {_id: req.body.role}]})) || {})._id || '';
        if (!role) return res.status(400).send({error: `Role ${CONSTANT.NOT_EXISTS} ${req.body.role}`});
        const user = await UserModel.findOne({email: req.body.email, role: role}, {firstName: 1, lastName: 1, email: 1});
        if (!user) return res.status(400).send({error: `User ${CONSTANT.NOT_EXISTS} ${req.body.email}`});

        const response = await emailOtp(user);
        if (response.error) return res.status(400).send({error: response.error, message: "Failed to send OTP!"});

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: `OTP Sent successfully, please check your email.`
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const validateLogin = async (req, res, next) => {
    try {
        return res.status(200).send(req.user ? { result : { msg :'Token is valid!',status:'success' } } : { error: 'Token is not valid!' });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const logout = async (req, res, next) => {
    try {
        let token = (req.headers['authorization'] || '').toString();

        await SessionModel.updateOne({token: token, logout: false}, {$set: {logout: true}});

        return res.status(200).send({ result: 'Session successfully logged out.' });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const emailOtp = async (user) => {
    try {
        if (!user.email) return {error: 'Email id is required!'};
        
        let randomNumber = await UTILS.getRandomNumber();

        let otp = {
            type: "OTP",
            token: randomNumber,
            userId: user._id,
            email: user.email,
            expiry: moment().add(10, 'm').valueOf(),
            active: true
        };
        otp = new OtpModel(otp);
        otp = await otp.save();
        
        let compiled = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../../docs/email_templates/emailLogin.ejs'), 'utf8')),
        dataToCompile = {
            token: randomNumber,
            userName: `${user.firstName || ''} ${user.lastName || ''}`,
            register: false
        };

        await mail.sendMail([user.email], 'Women Listed : Sign In OTP', compiled(dataToCompile));
        
        return {result: 'Success'};
    } catch (error) {
        return UTILS.errorHandler(error);
    }
};

const verifyEmailOtp = async (req, res, next) => {
    try {
        const schema = Joi.object({
            email: Joi.string().required(),
            token: Joi.number().required()
        });
        
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        const otp = await OtpModel.findOne({email: req.body.email, token: req.body.token, active: true});
        if (!otp) return res.status(400).send({error: "Your OTP is not valid!"});
        if (otp.expiry < moment().valueOf()) return res.status(400).send({error: "OTP valid only for 10 minutes. Request for new token!"});
       
        let user = await UserModel.findOne({_id: otp.userId}, {password: 0});
        if (!user) return res.status(400).send({error: `User${CONSTANT.NOT_EXISTS}${req.body.phoneNumber}`});
        user = UTILS.cloneObject(user);

        user.registered = true;
        if (!user.firstName || !user.lastName || !user.email) user.registered = false;
        user.token = await Auth.generateJWTToken({userId: user._id, type: modelName});

        await OtpModel.updateOne({email: otp.email}, {$set: {token: '', active: false}});

        const socket_connect = {
            topic: process.env.MQTT_TOPIC+'_'+user._id.toString(),
            url: process.env.MQTT_URL,
            clientId: process.env.MQTT_CLIENT_ID
        };
        
        await mqtt.subscribe(socket_connect.topic);
        
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: user,
            socket_connect: socket_connect
        });
    } catch (error) {
        return UTILS.errorHandler(error);
    }
};

const resendEmailOtp = async (req, res, next) => {
    try {
        const schema = Joi.object({
            email: Joi.string().required(),
            role: Joi.string().required()
        });
        
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        const role = ((await RoleModel.findOne({$or: [{code: req.body.role.toUpperCase()}, {_id: req.body.role}]})) || {})._id || '';
        if (!role) return res.status(400).send({error: `Role ${CONSTANT.NOT_EXISTS} ${req.body.role}`});
        const user = await UserModel.findOne({email: req.body.email, role: role});
        if (!user) return res.status(400).send({error: `User ${CONSTANT.NOT_EXISTS} ${req.body.email}`});

        let otp = await OtpModel.findOne({email: req.body.email, active: true});
        if (otp) otp = UTILS.cloneObject(otp);
        let randomNumber = await UTILS.getRandomNumber();
        const expiryTime = moment().add(10, 'm').valueOf();
        if (otp && otp.expiry < moment().valueOf()) {
            await OtpModel.updateOne({_id: otp._id}, {$set: {token: randomNumber, expiry: expiryTime}});
        } else if (otp && otp.expiry >= moment().valueOf()) {
            randomNumber = otp.token;
        } else {
            otp = {
                type: "OTP",
                token: randomNumber,
                userId: user._id,
                email: user.email,
                expiry: expiryTime,
                active: true
            };
            otp = new OtpModel(otp);
            otp = await otp.save();
        }
        
        let compiled = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../../docs/email_templates/emailLogin.ejs'), 'utf8')),
            dataToCompile = {
                token: randomNumber,
                userName: `${user.firstName || ''} ${user.lastName || ''}`,
                register: false
            };

        await mail.sendMail([user.email], 'Women Listed : Sign In OTP', compiled(dataToCompile));

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: `OTP resent successfully, please check your email.`
        });
    } catch (error) {
        return UTILS.errorHandler(error);
    }
};

const generateOtp = async (mobile) => {
    try {
        if (!mobile) return {error: 'Your mobile is not valid!'};
        
        var templateId = '6210933939589a11d13b2db5'; 

        var params = {
            otp_length: "4", // Optional
            otp_expiry: "1440" // Optional
        }, args = {
            "VAR1": "VALUE1",
            "VAR2": "VALUE2"
        };

        return new Promise(resolve => {
            msg91.sendOTP(mobileNo, templateId, params, args, (error, response) => {
                resolve(error ? { error } : { response })
            });
        });
    } catch (error) {
        return UTILS.errorHandler(error);
    }
};

const verifyOtp = async (req, res, next) => {
    try {
        const schema = Joi.object({
            phoneNumber: Joi.number().required(),
            otp: Joi.number().required()
        });
        
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        let user = await UserModel.findOneAndUpdate({phoneNumber: parseInt(req.body.phoneNumber)}, {$set: {active: true}}, {returnOriginal: false});
        if (!user) return res.status(400).send({error: "Please request for OTP first", message: `User${CONSTANT.NOT_EXISTS}${req.body.phoneNumber}`});
        user = UTILS.cloneObject(user);

        // const result = await new Promise(resolve => {
        //     msg91.verifyOTP(req.body.phoneNumber, req.body.otp, (error, response) => {
        //         resolve(error ? { error } : { response })
        //     });
        // });

        // if (result.error) return res.status(400).send(result);
        user.registered = true; 
        if (!user.firstName || !user.lastName || !user.email) user.registered = false;
        user.token = await Auth.generateJWTToken({userId: user._id, type: modelName});

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: user
        });
    } catch (error) {
        return UTILS.errorHandler(error);
    }
};

const resendOtp = async (req, res, next) => {
    try {
        const schema = Joi.object({
            phoneNumber: Joi.number().required(),
            role: Joi.string().required()
        });
        
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        const role = ((await RoleModel.findOne({code: req.body.role.toUpperCase()})) || {})._id || '';
        if (!role) return res.status(400).send({error: `Role ${CONSTANT.NOT_EXISTS} ${req.body.role}`});
        const user = await UserModel.countDocuments({phoneNumber: parseInt(req.body.phoneNumber), role: role});
        if (!user) return res.status(400).send({error: `User ${CONSTANT.NOT_EXISTS} ${req.body.phoneNumber}`});

        // const result = await new Promise(resolve => {
        //     msg91.resendOTP(req.body.phoneNumber, (error, response) => {
        //         resolve(error ? { error } : { response })
        //     });
        // });
        
        // if (result.error) return res.status(400).send(result);
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: 'Please check your resend OTP on your mobile!'
        });
    } catch (error) {
        return UTILS.errorHandler(error);
    }
};

const registration = async (req, res, next) => {
    try {
        let user = await FILE_UPLOAD.uploadMultipleFile(req);

        const schema = Joi.object({
            email: Joi.string().required(),
            phoneNumber: Joi.number().required(),
            password: Joi.string(),
            quoteTagLine: Joi.string(),
            role: Joi.string(),
            businessName: Joi.string(),
            gstNumber: Joi.string(),
            category: Joi.string(),
            biography: Joi.string(),
            files: Joi.array(),
            commisionType: Joi.string(),
            location: Joi.object(),
            bankDetails: Joi.object(),
            userName: Joi.string().trim(),
            firstName: Joi.string().trim(),
            experience: Joi.number(),
            age: Joi.number(),
            socialLink: Joi.string(),
            lastName: Joi.string().trim()
        });
        
        const { error } = schema.validate(user);
        if (error) return res.status(400).send({ error });

        let validate = await UserModel.countDocuments({$or: [{email: user.email}, {phoneNumber: user.phoneNumber}]});
        if (validate) return res.status(400).send({error: `User ${CONSTANT.EXISTS} ${user.email} or ${user.phoneNumber}`});

        let files = user.files;
        if (files.length) {
            user.file = files.filter(e => e.fieldName == 'file').map(file => file._id)[0];
            user.coverPhoto = files.filter(e => e.fieldName == 'coverPhoto').map(file => file._id)[0];
        }
        delete user.files;

        if (user.category) user.category = [user.category];
        user.role = user.role || ((await RoleModel.findOne({code: 'PROFESSIONAL'})) || {})._id || '';
        user.active = false;
        user.firstLogin = true;
        user.online = true;
        user.private = true;
        user = new UserModel(user);
        user = await user.save();
        if (!user) return res.status(400).send({error: "User registration failed"});

        user = UTILS.cloneObject(user);
        delete user.password;
        delete user.registerDevices;

        await addDefaultConnections(user);

        if (user.email) {
            let randomNumber = await UTILS.getRandomNumber();
    
            let otp = {
                type: "OTP",
                token: randomNumber,
                userId: user._id,
                email: user.email,
                expiry: moment().add(10, 'm').valueOf(),
                active: true
            };
            otp = new OtpModel(otp);
            otp = await otp.save();

            let compiled = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../../docs/email_templates/emailLogin.ejs'), 'utf8')),
                dataToCompile = {
                    token: randomNumber,
                    userName: `${user.firstName || ''} ${user.lastName || ''}`,
                    register: true
                };

            await mail.sendMail([user.email], 'Welcome, thank you for registering with Women Listed', compiled(dataToCompile));
        }

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: 'OTP sent successfully'
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const addDefaultConnections = async (user) => {
    try {
        const role = await RoleModel.findOne({_id: user.role}, {code: 1});
        if (role.code == 'PROFESSIONAL') {
            let users = await UserModel.find({email: {$in: ['info@womenlisted.com', 'info@sippingthoughts.com']}}, {_id: 1});

            for (let userRec of users) {
                let connection = {
                    status: "APPROVED",
                    requestedTo: '',
                    createdBy: user._id,
                    updatedBy: user._id
                };
                connection.requestedTo = userRec._id;
                connection = new ConnectionsModel(connection);
                connection = await connection.save();
                // await UserModel.updateMany({_id: {$in: [connection.requestedTo, connection.createdBy]}}, {$inc: {connectionsCount: 1}});
            }
        }

        return true;
    } catch (error) {
        return UTILS.errorHandler(error);
    }
}

const validateUserName = async (req, res, next) => {
    try {
        const schema = Joi.object({
            userName: Joi.string().required()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send({ error });

        let query = {userName: req.body.userName};
        if (req.query._id) query._id = {$ne: req.query._id};
        const validate = await UserModel.countDocuments(query);
        if (validate) return res.status(200).send({error: "User name already exists!"});

        return res.status(200).send({result: "User name is available!"});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const validateEmail = async (req, res, next) => {
    try {
        const schema = Joi.object({
            email: Joi.string().required()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send({ error });

        let query = {email: req.body.email};
        if (req.query._id) query._id = {$ne: req.query._id};
        const validate = await UserModel.countDocuments(query);
        if (validate) return res.status(200).send({error: "Email id already exists!"});

        return res.status(200).send({result: "Email id is available!"});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getUserProfile = async (req, res, next) => {
    try {
        req.user = req.user && req.user._id ? req.user : {_id: ''};
        if (!req.query._id && !req.query.userName) return res.status(200).send({error: "User id/name is required!"});
        let roles = ((await RoleModel.find({code: {$in: [process.env.ROLE_PROFESSIONAL, process.env.ROLE_USER, 'SUPER_ADMIN']}})) || []).map(e => e._id);
        let query = {role: {$in: roles}};
        if (req.query._id) query._id = req.query._id
        // if (req.query.userName) query.userName = new RegExp(req.query.userName, "i");
        if (req.query.userName) query.userName = req.query.userName;
        let user = await UserModel.findOne(query).populate('file', 'name original path thumbnail smallFile').populate('coverPhoto', 'name original path thumbnail smallFile');
        if (!user) return res.status(200).send({error: "No user found!"});

        const productsCount = await dbModels.ProductModel.countDocuments({createdBy: user._id});
        const reviewsCount = await dbModels.ReviewModel.countDocuments({status: 'APPROVED', _id: {$in: (user.overallReview || {}).review}});
        const data = {};

        let records = [
            {model: 'ConnectionsModel', query: {$or: [
                {requestedTo: ObjectId(req.user._id), createdBy: ObjectId(user._id)},
                {createdBy: ObjectId(req.user._id), requestedTo: ObjectId(user._id)}
            ], status: {$in: ["APPROVED", "REQUESTED"]}}, value: 'connections', filter: {}},
            {model: 'ConnectionsModel', query: {requestedTo: user._id, status: "REQUESTED"}, value: 'requestedConnections', filter: {_id: 1}},
            {model: 'CategoryModel', query: {_id: {$in: user.category}}, value: 'categories', filter: {}}
        ].map(async record => {
            data[record.value] = (req.user._id || record.value != 'connections') ? UTILS.cloneObject(await dbModels[record.model].find(record.query, record.filter).sort({updatedAt: -1}).limit(10).skip(0).populate('files', 'name original path thumbnail smallFile')) : [];
            return true;
        });

        await Promise.all(records);

        const record = {
            _id: user._id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            userName: user.userName,
            businessName: user.businessName,
            gstNumber: user.gstNumber,
            firstName: user.firstName,
            lastName: user.lastName,
            biography: user.biography,
            role: user.role,
            private: user.private,
            file: user.file,
            experience: user.experience,
            age: user.age,
            quoteTagLine: user.quoteTagLine,
            coverPhoto: user.coverPhoto,
            favourites: user.favourites,
            socialLink: user.socialLink || '',
            bankDetails: user.bankDetails || {},
            location: user.location || {},
            createdAt: user.createdAt,
            productsCount: productsCount,
            reviewsCount: reviewsCount,
            category: (data.categories || []).map(e => e.name),
            overallReview: user.overallReview,
            connectionsCount: user.connectionsCount >= 0 ? user.connectionsCount : 0,
            postsCount: user.postsCount,
            requestedConnectionCount: user._id.toString() != req.user._id.toString() ? 0 : data.requestedConnections.length,
            connectionRecord: {}
        };

        record.connectionRecord = user._id.toString() == req.user._id.toString() ? {} : data.connections.find(e => (e.status == 'APPROVED') || (e.status == 'REQUESTED')) || {};

        return res.status(200).send({result: record});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getStates = async (req, res, next) => {
    try {
        const states = await StateModel.find(req.query || {});

        return res.status(200).send({result: states});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getUserStates = async (req, res, next) => {
    try {
        let role = ((await RoleModel.findOne({code: process.env.ROLE_PROFESSIONAL})) || {})._id || '';
        let result = await UserModel.find({role: role, private: false}, {'location.state': 1});
        result = (UTILS.cloneObject(result)).map(e => e['location'] ? e['location']['state'] : null).filter(e => e);
        result = [...new Set(result)];

        return res.status(200).send({result: result});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getSearchResults = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);

        let role = ((await RoleModel.findOne({code: process.env.ROLE_PROFESSIONAL})) || {})._id || '';
        let query = {role: role, private: JSON.parse((req.query.private || "false").toLowerCase())};
        if (req.query.categoryId) query['category'] = {$in: req.query.categoryId.split(",")};
        if (req.query.rating) query['overallReview.avgRating'] = {$gt: parseInt(req.query.rating)};
        if (req.query.minAge && req.query.maxAge) query['age'] = {$gte: parseInt(req.query.minAge), $lte: parseInt(req.query.maxAge)};
        if (req.query.minExp && req.query.maxExp) query['experience'] = {$gte: parseInt(req.query.minExp), $lte: parseInt(req.query.maxExp)};
        if (req.query.state) query['location.state'] = {$in: req.query.state.split(",").map(e => new RegExp(e, "i"))};
        query['_id'] = {'$ne': req.user._id};
        let sort = {};
        if (req.query.orderedBy) sort['createdAt'] = req.query.orderedBy == 'true' ? 1 : -1;
        
        let users = await UserModel.find(query).sort(sort)
                        .limit(limit).skip(pagination*limit)
                        .populate('category', 'name')
                        .populate('file', 'name original path thumbnail smallFile');
        if (!users || !users.length) return res.status(200).send({error: "No user found!", result: []});

        users = UTILS.cloneObject(users);

        return res.status(200).send({result: users});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getSearchList = async (req, res, next) => {
    try {
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.private;

        let docs = {};
        docs.categories = await CategoryModel.find(query, {name: 1, _id: 1}).sort({createdAt: -1});
        // query.role = ((await RoleModel.findOne({code: process.env.ROLE_PROFESSIONAL})) || {})._id || '';
        query.private = JSON.parse((req.query.private || "false").toLowerCase());
        docs.users = await UserModel.find({private: false, $or: [{userName: query.name}, {firstName: query.name}, {lastName: query.name}]}, {firstName: 1, lastName: 1, role: 1, userName: 1, _id: 1}).sort({userName: -1});

        return res.status(200).send({result: UTILS.cloneObject(docs)});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const uploadCoverPhoto = async (req, res, next) => {
    try {
        let file = ((await FILE_UPLOAD.uploadMultipleFile(req)).files || [])[0];
        
        if (!file || !file._id) return res.status(400).send({error: "File upload failed"});

        const user = await UserModel.updateOne({_id: req.query.id || req.user._id}, {$set: {coverPhoto: file._id}});
        if (!user) return res.status(400).send({error: "User update failed"});

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: file.path
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const uploadProfilePhoto = async (req, res, next) => {
    try {
        let file = ((await FILE_UPLOAD.uploadMultipleFile(req)).files || [])[0];
        
        if (!file || !file._id) return res.status(400).send({error: "File upload failed"});
        
        const user = await UserModel.updateOne({_id: req.query.id || req.user._id}, {$set: {file: file._id}});
        if (!user) return res.status(400).send({error: "User update failed"});

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: file.path
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const get = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = {};
        if (Object.keys(req.query).length) query = req.query;
        else query = {_id: req.user._id};
        delete query.pagination;
        delete query.limit;

        if (query._id) query._id = ObjectId(query._id);
        let docs = await UserModel.find(query, {password: 0, registerDevices: 0}).sort({createdAt: -1})
                    .limit(limit).skip(pagination*limit)
                    .populate('category', 'name')
                    .populate('file', 'name original path thumbnail smallFile')
                    .populate('coverPhoto', 'name original path thumbnail smallFile');
        docs = UTILS.cloneObject(docs);

        if (query._id && docs && docs.length) docs[0].notificationCount = await NotificationModel.count({userId: query._id, isRead: false});
        const carts = await CartModel.find({createdBy: {$in: docs.map(e => e._id)}, active: true}, {createdBy: 1, products: 1}).sort({createdAt: -1});
        docs = docs.map(doc => {
            doc.productsCount = ((carts.find(e => e.createdBy == doc._id) || {}).products || []).length;
            return doc;
        });
        
        if (Object.keys(req.query).length) docs = UTILS.cloneObject(docs).filter(e => e._id != req.user._id);
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getUnfollowedGroupUsers = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);

        if (!req.params.groupId) return res.status(400).send({error: "Group Id is required!"});
        if (!req.user._id) return res.status(400).send({error: "User Id is required!"});

        let followedUsers = await ConnectionsModel.find({status: "APPROVED", $or: [{requestedTo: req.user._id}, {createdBy: req.user._id}]}, {requestedTo: 1, createdBy: 1});
        followedUsers = UTILS.cloneObject(followedUsers).map(e => e.requestedTo.toString() == req.user._id.toString() ? e.createdBy : e.requestedTo);
        followedUsers.push(req.user._id.toString());

        let group = null;
        if (req.params.groupId != 'false') {
            group = await GroupModel.findOne({_id: req.params.groupId}, {users: 1});
            if (!req.query.followed) followedUsers = [...new Set([...followedUsers, ...((group || {}).users || [])])];
        }

        let query = {_id: {$nin: followedUsers}, private: false};
        if (req.query.followed == 'true' && group && group.users) query['_id'] = {"$in": followedUsers.filter(e => (!group.users.includes(e) && e != req.user._id.toString()))};
        query['email'] = {$nin: ['info@womenlisted.com', 'info@sippingthoughts.com']};
        let docs = await UserModel.find(query, {password: 0, registerDevices: 0}).sort({createdAt: -1})
                    .limit(limit).skip(pagination*limit)
                    .populate('category', 'name')
                    .populate('file', 'name original path thumbnail smallFile');
        docs = UTILS.cloneObject(docs);

        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getRandomUsers = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 6);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let roles = ((await RoleModel.find({code: {$in: [process.env.ROLE_PROFESSIONAL, process.env.ROLE_USER]}})) || []).map(e => e._id);
        let query = {role: {$in: roles}, userName: {$exists: true}};
        if (Object.keys(req.query).length) query = req.query;
        delete query.pagination;
        delete query.limit;

        let docs = await UserModel.aggregate([
            { $match: { role: {$in: roles}, userName: {$exists: true} } },
            { $sample: { size: limit } },
            { $project : { firstName: 1, lasstName: 1, userName: 1, file: 1 } }
        ]);
        docs = UTILS.cloneObject(docs);

        const files = await FileModel.find({_id: {$in: docs.map(e => e.file)}}, {name: 1, original: 1, path: 1, thumbnail: 1, smallFile: 1});

        docs = docs.map(doc => {
            doc.file = files.find(e => e._id == doc.file) || {};
            return doc;
        });

        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getMyOrder = async (req, res, next) => {
    try{
        const review = await OrderModel.find({orderedBy: req.params.userId});
        return res.status(200).send({result: review});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getMyReview = async (req,res, next) => {
    try{
        const review = await ReviewModel.find({createdBy: req.params.userId});
        return res.status(200).send({result: review});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error))
    }
};

const getUserCategories = async (req, res, next) => {
    try {
        let where = req.query._id ? req.query._id :req.user._id;
        let docs = await UserModel.find({_id: ObjectId(where)}, {category: 1}).populate('category', 'name');
        docs = UTILS.cloneObject(docs);

        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    try {
        let where = req.query._id ? req.query._id :req.user._id;
        if (!where) return res.status(400).send({error: "User id is required"});
        
        const schema = Joi.object({
            userName: Joi.string().required(),
            email: Joi.string().required(),
            phoneNumber:Joi.number().empty(''),
            role: Joi.string().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().empty(''),
            active: Joi.boolean()

        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send({ error });
       
        let updateRec = {};
        req.body.updatedBy = req.user._id;
        // updateRec['$push'] = {category: req.body.category};
        // delete req.body.category;
        // updateRec['$set'] = req.body;
        let user = await UserModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!user) return res.status(400).send({error: "User update failed"});

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "User updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};



const update_profile = async (req, res, next) => {
    try {
      
        if (!req.params.id) return res.status(400).json({error: "User id is required"});
        let profile = await FILE_UPLOAD.uploadMultipleFile(req);
        
        const schema = Joi.object({
            userName: Joi.string().required(),
            email: Joi.string().required(),
            phoneNumber:Joi.number().empty(''),
            role: Joi.string().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().empty(''),
            files: Joi.array(),
            active: Joi.boolean()

        });

        const { error } = schema.validate(profile);
        if (error) return res.status(400).send({ error });
       
        profile.updatedBy = req.user._id;

        if (profile.files.length) profile.file = profile.files.map(file => file._id);
        else delete profile.files;

        let user = await UserModel.updateOne({_id: req.params.id}, {$set: profile});
        if (!user) return res.status(400).send({error: "User update failed"});

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "User updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateStatus = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({error: "User id is required"});
        
        const schema = Joi.object({
            active: Joi.boolean(),
            private: Joi.boolean()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send({ error });

        req.body.updatedBy = req.user._id;
        const user = await UserModel.findOneAndUpdate({_id: req.params.id}, {$set: req.body}, {returnOriginal: false});
        if (!user) return res.status(400).send({error: "User Status update failed"});

        const validate = await RoleModel.countDocuments({_id: user.role, code: "PROFESSIONAL"});

        if ((req.body.active || req.body.private) && validate && req.user._id.toString() != user._id.toString()) {
            let notification = {
                type: "PROFESSIONAL_STATUS",
                device : ["DESKTOP"],
                message: `You account has been ${req.body.private ? 'public' : 'activated'} by ${req.user.firstName} ${req.user.lastName}.`,
                userId: user._id,
                data: {},
                isRead: false,
                active: true,
                createdBy: req.user._id,
                updatedBy: req.user._id
            };
            notification = new NotificationModel(notification);
            await notification.save();
        }

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "User Status updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

//add product in wishlist
const wishlist = async(req, res, next) => {
    try {
        if (!req.user._id) return res.status(400).send({error: "User id is required"});
        
        const schema = Joi.object({
            favourites: Joi.string().required(),
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send({ error });

        let updateRec = {};
        updateRec.updatedBy = req.user._id;
        updateRec['$addToSet'] = req.body;
      
        let user = await UserModel.findOneAndUpdate({_id: req.user._id}, updateRec, {returnOriginal: false});
        if (!user) return res.status(400).send({error: "Wishlist update failed"});

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Add to Wishlist Successfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

//get wishlist list
const getUserWishlist = async(req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);

        let docs = UTILS.cloneObject(await UserModel.findOne({_id: req.user._id}, {favourites: 1}));
        docs = docs.favourites || [];

        docs = await ProductModel.find({_id: {$in: docs}}, {name: 1, productId: 1, price: 1, files: 1, specialPrice: 1, specialPriceActive: 1, currency: 1})
                    .sort({createdAt: -1}).limit(limit).skip(pagination*limit)
                    .populate('files', 'name original path thumbnail smallFile')
                    .populate({
                        path: "createdBy",
                        select: 'firstName lastName userName file role',
                        populate: {
                            path: "file",
                            select: 'name original path thumbnail smallFile'
                        }
                    });

        let reviews = await ReviewModel.find({status: {$in: ['APPROVED', 'DECLINED']}, product: {$in: docs.map(e => e._id)}}, {rating: 1, product: 1});

        docs = UTILS.cloneObject(docs).map(doc => {
            if (doc.specialPriceEndDate <= moment().valueOf()) doc.specialPriceActive = false;
            doc.rating = (reviews.filter(e => e.product.toString() == doc._id.toString()) || []).map(e => e.rating).filter(e => e);
            doc.rating = (_.sum(doc.rating))/doc.rating.length;

            return doc;
        }).filter(e => e && e.createdBy);

        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

//remove product from wishlist
const removeWishlist = async(req, res, next) => {
    try {
        if (!req.user._id) return res.status(400).send({error: "User id is required"});
        
        const schema = Joi.object({
            favourites: Joi.required(),
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send({ error });

        let updateRec = {};
        updateRec.updatedBy = req.user._id;
        //updateRec['$set'] = req.body;
      
        let user = await UserModel.updateOne({_id: req.user._id},
            { $pull: { favourites: req.body.favourites } },
            {returnOriginal: false});
        if (!user) return res.status(400).send({error: "Wishlist remove failed"});

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Remove from Wishlist Successfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

//get users and professional list by via professional id
const getUserList = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let where = {};
       
        if(req.query._id) where._id = ObjectId(req.query._id);
        if(req.query.role) where.role = ObjectId(req.query.role); 

        where = req.query;  
        delete where.pagination;
        delete where.limit;
        
        let docs = await UserModel.find(where).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('category', 'name').populate('role', 'name');
        docs = UTILS.cloneObject(docs);
        
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const remove = async (req, res, next) => {
    try {
       
        let findrole = await RoleModel.findOne({_id:ObjectId(req.user.role)});
       
        if (findrole.code == "SUPER_ADMIN")
        {
           
            if (!req.params.id) return res.status(400).json({error: "Professional Id is required"});
       
        }else{
        if (req.params.id.toString() != req.user._id.toString()) return res.status(400).json({error: "You don't have access to delete this user"});
        }
        const schema = Joi.object({
            id: Joi.string().required()
        });
       
        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });
        const userId = ObjectId(req.params.id);
        const user = await UserModel.findOne({_id: userId});
        let connections = await ConnectionsModel.find({$or: [{requestedTo: userId}, {createdBy: userId}]});

        await UserModel.remove({_id: userId});
        await FileModel.remove({_id: {$in: [user.file, user.coverPhoto]}});
        await ConnectionsModel.remove({_id: {$in: connections.map(e => e._id)}});
        await OrderModel.remove({orderedBy: userId});
        await OtpModel.remove({userId: userId});
        // await ReviewModel.remove({createdBy: userId});
        // await ProductModel.remove({createdBy: userId});
        // await ServiceModel.remove({createdBy: userId});
        await ReviewModel.updateOne({createdBy: userId}, {$set: {active: false}});
        await ProductModel.updateOne({createdBy: userId}, {$set: {active: false}});
        await ServiceModel.updateOne({createdBy: userId}, {$set: {active: false}});
        // change it to update method
        await UserPostsModel.remove({createdBy: userId});

        let connectionList = [];
        connections.forEach(e => {
            if (e.status == 'APPROVED') {
                connectionList.push(e.requestedTo);
                connectionList.push(e.createdBy);
            }
        });
        connectionList = [...new Set(connectionList)];

        await UserModel.updateMany({_id: {$in: connectionList}}, {$inc: {connectionsCount: -1}});
        await UserPostsModel.updateMany({$pull: {likes: userId, comments: {commentedBy: userId}}});

        return res.status(200).send({ result: "User deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

//user data Export to Excel
const exportUserList = async (req, res, next) => {
    try {
        let where = {};
        if(req.query.role) {where = {role : ObjectId(req.query.role)}}
        where = req.query;  

        let docs = await UserModel.find(where).populate('category', 'name').populate('role', 'name');
        docs = UTILS.cloneObject(docs);
       
        let userData = [];
        docs.forEach((obj) => {
        userData.push({
        firstName: obj.firstName,
        lastName: obj.lastName,
        userName: obj.userName,
        email: obj.email,
        phoneNumber: obj.phoneNumber,
        biography: obj.biography,

      });

    });
   
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("userData");
    worksheet.columns = [
      { header: "first Name", key: "firstName", width: 25 },
      { header: "last Name", key: "lastName", width: 25 },
      { header: "User Name", key: "userName", width: 25 },
      { header: "Email Address", key: "email", width: 25 },
      { header: "Contact Number", key: "phoneNumber", width: 25 },
      { header: "Biography", key: "biography", width: 25 },

    ];
    // Add Array Rows
    worksheet.addRows(userData);
    //console.log(userData) 
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "userDetails.xlsx"
    );
    return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
      });
        //return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getAllCounts = async (req, res, next) => {
    try {
        let count = {};

        count.notificationsCount = await NotificationModel.count({userId: req.user._id, isRead: false});
        count.requestedConnectionCount = await ConnectionsModel.count({requestedTo: req.user._id, status: "REQUESTED"});
        count.connectionsCount = (await UserModel.findOne({_id: req.user._id}, {connectionsCount: 1})).connectionsCount || 0;
        count.groupRequests = await GroupModel.find({createdBy: req.user._id}, {_id: 1});
        count.groupRequests = UTILS.cloneObject(await GroupRequestModel.find({group: {$in: count.groupRequests.map(e => e._id)}, status: 'REQUESTED'}, {_id: 1}));
        count.groupRequests = _.groupBy(count.groupRequests, e => e.group);
        Object.keys(count.groupRequests).forEach(key => {
            count.groupRequests[key] = count.groupRequests[key].length;
        });

        return res.status(200).send({ result: count });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const userdetail = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;

        let docs = await UserModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


////////////////////////


const changePassword = async (req, res, next) => {

    let data = req.body
 
    try {
        const schema = Joi.object({
            oldPassword:Joi.string().required(),
            newPassword: Joi.string().min(6).max(15).required(),
            confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
           
        });
        
        const { error } = schema.validate(data);
        if (error) return res.status(400).json({ error });
        
            let user = await UserModel.findOne({_id: ObjectId(req.user._id)}, {password: 0});
            
            if (!user) return res.status(400).send({error: `User does not exists`});
    
            let validate = await user.isValidPassword(req.body.oldPassword);
            if(validate)
            {
                const salt = await bcrypt.genSalt(parseInt(process.env.HASH_COST));
                let password = await bcrypt.hash(req.body.newPassword, salt);
                let updatePassword = await UserModel.updateOne({_id:  req.user._id}, {$set: {password:password,firstLogin:false}});
                 if (updatePassword)
                 {
                    
                    // let compiled = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../../docs/email_templates/changePasswordMail.ejs'), 'utf8')),
                    // dataToCompile = {
                    //     userName: `${user.firstName || ''} ${user.lastName || ''}`,
                    // };
    
                    // await mail.sendMail([user.email], 'Password Change Successfully', compiled(dataToCompile));
 
                    // let token = (req.headers['authorization'] || '').toString();
                    // await SessionModel.updateOne({token: token, logout: false}, {$set: {logout: true}});
                
                    return res.status(200).send({ result : { msg :'Password change successfully..!!!',status:'SUCCESS!' } });
                    
                 }else{ 
                    return res.status(400).json({error: "Password update failed"});
                }
                

            }else{
                validate = !validate ? CONSTANT.INVALID_PASSWORD : !user.active ? 'User'+CONSTANT.INACTIVE : null;
                if (validate) return res.status(400).send({error: validate});
                
            }

        

    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

////////////////////////
module.exports = {
    login,
    otpLogin,
    logout,
    emailOtp,
    verifyEmailOtp,
    resendEmailOtp,
    resendOtp,
    verifyOtp,
    registration,
    validateUserName,
    validateEmail,
    validateLogin,
    uploadProfilePhoto,
    uploadCoverPhoto,
    get,
    update,
    remove,
    getMyOrder,
    getMyReview,
    getUserProfile,
    getSearchResults,
    getSearchList,
    getUserCategories,
    getRandomUsers,
    wishlist,
    getUserWishlist,
    getUnfollowedGroupUsers,
    removeWishlist,
    getStates,
    getUserStates,
    updateStatus,
    getUserList,
    getAllCounts,
    exportUserList,
    userdetail,
    update_profile,
    changePassword
};