'use strict';

const modelName                 = 'Message';
const Joi                       = require('@hapi/joi');
const { MessageModel }          = require('@database');
const CONSTANT                  = require('@lib/constant');
const UTILS                     = require('@lib/utils');
const ObjectId                  = require('mongodb').ObjectId;
const FILE_UPLOAD               = require('@lib/file_upload');

const create = async (req, res, next) => {
    let message = await FILE_UPLOAD.uploadMultipleFile(req);
    message.active = message.active == false ? false : true;
    
    try {
        const schema = Joi.object({
            user: Joi.string(),
            group: Joi.string(),
            status: Joi.string(),
            message: Joi.string(),
            files: Joi.array(),
            active: Joi.boolean().required(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(message);
        if (error) return res.status(400).json({ error });

        if (!message.status && message.files.length) message.status = 'IMAGE';
        
        if (message.files.length) message.files = message.files.map(file => file._id);
        else delete message.files;

        message.user = [message.user, req.user._id];
        message.createdBy = req.user._id;
        message.updatedBy = req.user._id;

        message = new MessageModel(message);
        message = await message.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: message
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const get = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query, sort = {};
        if (query.message) query.message = new RegExp(query.message, "i");
        if (query.user) query['$and'] = [{user: ObjectId(query.user)}, {user: ObjectId(req.user._id)}];
        if (query.orderedBy) sort['createdAt'] = query.orderedBy == 'true' ? 1 : -1;
        delete query.pagination;
        delete query.limit;
        delete query.orderedBy;

        let docs = await MessageModel.find(query).sort(sort).limit(limit).skip(pagination*limit)
                                        .populate('files', 'name original path thumbnail smallFile')
                                        .populate('group', 'name')
                                        .populate({
                                            path: "user",
                                            select: 'email firstName lastName private userName file',
                                            populate: {
                                                path: "file",
                                                select: 'name original path thumbnail smallFile'
                                            }
                                        })
                                        .populate({
                                            path: "createdBy",
                                            select: 'email firstName lastName private userName file',
                                            populate: {
                                                path: "file",
                                                select: 'name original path thumbnail smallFile'
                                            }
                                        });

        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    let message = await FILE_UPLOAD.uploadMultipleFile(req);

    try {
        if (!req.params.id) return res.status(400).json({error: "Message id is required"});

        const schema = Joi.object({
            status: Joi.string(),
            message: Joi.string(),
            files: Joi.array(),
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(message);
        if (error) return res.status(400).json({ error });

        let files = [];
        if (message.files.length) files = message.files.map(file => file._id);
        delete message.files;

        message.updatedBy = req.user._id;
        
        message = {$set: message};
        if (files.length) message['$push'] = {files: {$each: files}};
        
        let messageRec = await MessageModel.updateOne({_id: ObjectId(req.params.id)}, message, {returnOriginal: false});
        if (!messageRec) return res.status(400).json({error: "Message update failed"});

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Message updated succesfully"
        });
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

        await MessageModel.remove({_id: req.params.id});
        return res.status(200).send({ result: "Message deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

module.exports = {
    create,
    get,
    update,
    remove
};