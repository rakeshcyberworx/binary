'use strict';

const modelName                     = 'Enquiry';
const Joi                           = require('@hapi/joi');
const { EnquiryModel,CompatativeEnquiryModel,WhitepaperEnquiryModel   }              = require('@database');
const CONSTANT                      = require('@lib/constant');
const UTILS                         = require('@lib/utils');
const ejs                           = require('ejs');
const fs                            = require('fs');
const path                          = require('path');
const mail                          = require('@lib/mailer');
const moment                        = require('moment');
const create = async (req, res, next) => {
    let enquiry = req.body || {};
    enquiry.active = true;

    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            phone: Joi.string().required(),
            email: Joi.string().email().required(),
            industry: Joi.string().empty(''),
            interest: Joi.array().empty(),
            pageName: Joi.string().empty(''),
            message: Joi.string().empty(''),
            concern: Joi.string().empty(''),
            active: Joi.boolean()
        });

        const { error } = schema.validate(enquiry);
        if (error) return res.status(400).json({ error });

        enquiry = new EnquiryModel(enquiry);
        enquiry = await enquiry.save();
        console.log(enquiry)
        if(enquiry.name){
            let enq = await EnquiryModel.find({_id:enquiry._id}).populate('industry','_id name');
            console.log(enq)
            let compiled = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../../docs/email_templates/contactenquiry.ejs'), 'utf8')),
            dataToCompile = {
                name:enq[0].name,
                email:enq[0].email,
                phone:enq[0].phone,
                message:enq[0].message,
                ...(enq[0].industry && {industry:enq[0].industry.name}),
                ...(enq[0].interest && {interest:enq[0].interest})
                         
            };
        
        await mail.sendMail([process.env.ADMIN_MAIL], `You have new Contact Enquiry `, compiled(dataToCompile));
        }

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: 'Enquiry sent successfully...'
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const get = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
      let query = req.query;
        delete query.limit;
        delete query.pagination;

        let docs = await EnquiryModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit) .populate('industry', '_id name');
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};



const remove = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await EnquiryModel.remove({ _id: req.params.id });
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "enquiry deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

// product enquriy
const createProject = async (req, res, next) => {
    let enquiry = req.body || {};
    enquiry.active = true;

    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            phone: Joi.string().required(),
            email: Joi.string().required(),
            project:Joi.string().empty(),
            concern: Joi.string().empty(''),
            active: Joi.boolean()
        });

        const { error } = schema.validate(enquiry);
        if (error) return res.status(400).json({ error });

        enquiry = new ProjectEnquiryModel(enquiry);
        enquiry = await enquiry.save();

        if(enquiry.name){
            let enq = await ProjectEnquiryModel.find({_id:enquiry._id}).populate('project','_id name');
         
            let compiled = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../../docs/email_templates/projectenquiry.ejs'), 'utf8')),
            dataToCompile = {
                name:enq[0].name,
                phone:enq[0].phone,
                email:enq[0].email,
                product:enq[0].project.name               
            };
          
        await mail.sendMail([process.env.ENQUIRY_MAIL], `You have new project Enquiry `, compiled(dataToCompile));
        }

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: enquiry
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const getProject = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let where = {};
        if (req.query.id) where._id = req.query.id;
     
        let docs = await ProjectEnquiryModel.find().sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('project','_id name');
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeProject = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await ProjectEnquiryModel.remove({ _id: req.params.id });
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "project enquiry successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

// HOme loan enquiry

// product enquriy
const createHomeloan = async (req, res, next) => {
    let enquiry = req.body || {};
    enquiry.active = true;

    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            phone: Joi.string().required(),
            email: Joi.string().required(),
            age:Joi.number().empty(),
            gender:Joi.string().empty(),
            concern: Joi.string().empty(''),
            active: Joi.boolean()
        });

        const { error } = schema.validate(enquiry);
        if (error) return res.status(400).json({ error });

        enquiry = new HomeLoanEnquiryModel(enquiry);
        enquiry = await enquiry.save();

        if(enquiry.name){
                    
            let compiled = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../../docs/email_templates/homeloan.ejs'), 'utf8')),
            dataToCompile = {
                name:enquiry.name,
                phone:enquiry.phone,
                email:enquiry.email,
                age:enquiry.age,
                gender:enquiry.gender                     
            };
          
        await mail.sendMail([process.env.ENQUIRY_MAIL], `You have new home loan Enquiry `, compiled(dataToCompile));
        }

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: enquiry
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const getHomeloan = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let where = {};
        if (req.query.id) where._id = req.query.id;
     
        let docs = await HomeLoanEnquiryModel.find().sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('project','_id name');
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
             result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeHomeloan = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await HomeLoanEnquiryModel.remove({ _id: req.params.id });
        return res.status(200).send({ 
             status: CONSTANT.REQUESTED_CODES.SUCCESS,
             result: "project enquiry successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
/////////////////

// interiou enquiry

const createCompetitive = async (req, res, next) => {
    let enquiry = req.body || {};
    enquiry.active = true;

    try {

        const schema = Joi.object({
            name: Joi.string().required(),
            phone: Joi.string().required(),
            email: Joi.string().required(),
            industry:Joi.string(),
            pageName:Joi.string().empty(''),
            type:Joi.string().empty(),
            message:Joi.string().empty(),
            concern: Joi.string().empty(''),
            active: Joi.boolean()
        });

        const { error } = schema.validate(enquiry);
        if (error) return res.status(400).json({ error });

        enquiry = new CompatativeEnquiryModel(enquiry);
        enquiry = await enquiry.save();

        if(enquiry.name){
            enquiry = await CompatativeEnquiryModel.findOne({_id:enquiry._id}).populate('industry','_id name');
                    
            let compiled = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../../docs/email_templates/competative.ejs'), 'utf8')),
            dataToCompile = {
                name:enquiry.name,
                phone:enquiry.phone,
                email:enquiry.email,
                industry:enquiry.industry.name,
                message:enquiry.message,
                pageName:enquiry.pageName,                     
            };
          
              await mail.sendMail([process.env.ENQUIRY_MAIL], `You have a new Enquiry from ${enquiry.pageName} `, compiled(dataToCompile));

        }
     
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: enquiry
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const getCompetitive = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query
        if(query.name) query.name = new RegExp(query.name,"i");

        delete query.limit;
        delete query.pagination;
  
        let docs = await CompatativeEnquiryModel.find(query).populate('industry','_id name').sort({createdAt: -1}).limit(limit).skip(pagination*limit);
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeCompetitive = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await CompatativeEnquiryModel.remove({ _id: req.params.id });
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "interior enquiry successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
////////////////////

// call back enquiyr

const createCallback = async (req, res, next) => {
    let enquiry = req.body || {};
    enquiry.active = true;

    try {
        const schema = Joi.object({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            phone: Joi.string().required(),
            email: Joi.string().required(),  
            youAre: Joi.string().empty(''),        
            concern: Joi.string().empty(''),
            active: Joi.boolean()
        });

        const { error } = schema.validate(enquiry);
        if (error) return res.status(400).json({ error });

        enquiry = new CallbackEnquiryModel(enquiry);
        enquiry = await enquiry.save();

        if(enquiry.firstName){
                    
            let compiled = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../../docs/email_templates/callback.ejs'), 'utf8')),
            dataToCompile = {
                name:enquiry.firstName,
                phone:enquiry.phone,
                email:enquiry.email,
                date:  moment(enquiry.createdAt).format('DD-MM-YYYY, h:mm:ss a')                       
            };
          
        await mail.sendMail([process.env.ENQUIRY_MAIL], `You have new call back Enquiry `, compiled(dataToCompile));
        }

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: enquiry
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const getCallback = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let where = {};
        if (req.query.id) where._id = req.query.id;
     
        let docs = await CallbackEnquiryModel.find().sort({createdAt: -1}).limit(limit).skip(pagination*limit);
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeCallback = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await CallbackEnquiryModel.remove({ _id: req.params.id });
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "callback enquiry successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
////////////////////


const createWhitepaper = async (req, res, next) => {
    let enquiry = req.body || {};
    enquiry.active = true;

    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().required(),
            whitepaper: Joi.string().required(),
            concern: Joi.string().empty(''),
            active: Joi.boolean()
        });

        const { error } = schema.validate(enquiry);
        if (error) return res.status(400).json({ error });

        enquiry = new WhitepaperEnquiryModel(enquiry);
        enquiry = await enquiry.save();

        if(enquiry.name){
            enquiry = await WhitepaperEnquiryModel.findOne({_id:enquiry._id});
            let compiled = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../../docs/email_templates/whitepaper.ejs'), 'utf8')),
            dataToCompile = {
                name:enquiry.name,
                whitepaper:enquiry.whitepaper.name,
                email:enquiry.email                    
            };
          
        await mail.sendMail([process.env.ENQUIRY_MAIL], `You have new whitepaper Enquiry `, compiled(dataToCompile));
        }

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: enquiry
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const getWhitepaper = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let where = {};
        if (req.query.id) where._id = req.query.id;
     
        let docs = await WhitepaperEnquiryModel.find(where).populate('whitepaper','_id name').sort({createdAt: -1}).limit(limit).skip(pagination*limit);
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeWhitepaper = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await WhitepaperEnquiryModel.remove({ _id: req.params.id });
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "callback enquiry successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
//////////////////


module.exports = {
    create,
    get,
    remove,
    createProject,
    getProject,
    removeProject,
    createHomeloan,
    getHomeloan,
    removeHomeloan,

    createCompetitive,
    getCompetitive,
    removeCompetitive,

    createCallback,
    getCallback,
    removeCallback,


    createWhitepaper,
    getWhitepaper,
    removeWhitepaper
    
};