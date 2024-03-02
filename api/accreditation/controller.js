'use strict';

const modelName                 = 'City';
const Joi                       = require('@hapi/joi');
const { AccreditationdModel,MetaModel }             = require('@database');
const CONSTANT                  = require('@lib/constant');
const UTILS                     = require('@lib/utils');
const FILE_UPLOAD               = require('@lib/file_upload');
const  sfu                     = require('slug');


const create = async (req, res, next) => {
    let award = await FILE_UPLOAD.uploadMultipleFile(req);
    award.active = true;

    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            description:Joi.string().empty(''),
            sortOrder:Joi.number().empty(''),
            active: Joi.boolean(),
            files: Joi.array(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        if (award.files.length) award.file = award.files.map(file => file._id);
        else delete award.files;

   
        award.createdBy = req.user._id;
        award.updatedBy = req.user._id;

        award = new AccreditationdModel(award);
        award = await award.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: award
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
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;

        let docs = await AccreditationdModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "city id is required"});
        let award = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            name: Joi.string().required(),
            description:Joi.string().empty(''),
            sortOrder:Joi.number().empty(''),
            active: Joi.boolean(),
            files: Joi.array(),  
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        if (award.files.length) award.file = award.files.map(file => file._id);
        else delete award.files;
        req.body.updatedBy = req.user._id;

        award = await AccreditationdModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!award) return res.status(400).json({error: "award update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "award updated succesfully"
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

        await AccreditationdModel.deleteOne({_id: req.params.id});
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "award deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};







const list = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;

        let record = {};

        record.accreditationList = await AccreditationdModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
     
        record.meta = await MetaModel.find({active:true,link:'accreditations'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile');

      
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};






////////////////////////



////////////////
module.exports = {
    create,
    get,
    update,
    remove,
    list
};