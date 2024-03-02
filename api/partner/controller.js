'use strict';

const modelName                     = 'Partners';
const Joi                           = require('@hapi/joi');
const { PartnerModel,PartnerTagModel,MetaModel }              = require('@database');
const CONSTANT                      = require('@lib/constant');
const UTILS                         = require('@lib/utils');
const FILE_UPLOAD                   = require('@lib/file_upload');
const { result }                    = require('@hapi/joi/lib/base');
const msg91                         = require("msg91-api")("343914ABecqB83V6bZ63199dfeP1");
const moment                        = require('moment');
const ejs                           = require('ejs');
const fs                            = require('fs');
const path                          = require('path');
const mail                          = require('@lib/mailer');





const create = async (req, res, next) => {
    let partner = await FILE_UPLOAD.uploadMultipleFile(req);
    partner.active = true;
    try {
    
        const schema = Joi.object({
        
            name: Joi.string().empty(''),
            slug: Joi.string(),
            description: Joi.string().empty(''),
            link: Joi.string().empty(''),
            type:Joi.string().empty(''),
            tag:Joi.array().empty(''),
            feature:Joi.number().empty(''),
            files: Joi.array(),
            active: Joi.boolean(),
            sortOrder: Joi.number().empty(''),
            customFields: Joi.object()
        });

        const { error } = schema.validate(partner);
        if (error) return res.status(400).json({ error });

        let files = partner.files;
        if (files.length) {
            partner.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete partner.files;

        partner.createdBy = req.user._id;
        partner.updatedBy = req.user._id;
        if(!partner.tag) delete partner.tag;
        
        partner = new PartnerModel(partner);
        partner = await partner.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: partner
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
        delete query.pagination;
        delete query.limit;

        if(query.search) {
            query.name = new RegExp(query.search,"i")
        }
        delete query.search;
        let docs    = await PartnerModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile')
        .populate('tag',"_id name")
        ;

        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const update = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "Partner id is required" });
        let partner = await FILE_UPLOAD.uploadMultipleFile(req);
        
        const schema = Joi.object({
            name: Joi.string().empty(''),
            slug: Joi.string(),
            description: Joi.string().empty(''),
            link: Joi.string().empty(''),
            type:Joi.string().empty(''),
            tag:Joi.array().empty(''),
            feature:Joi.number().empty(''),
            files: Joi.array(),
            active: Joi.boolean(),
            sortOrder: Joi.number().empty(''),
            customFields: Joi.object()
        });

        const { error } = schema.validate(partner);
        if (error) return res.status(400).json({ error });

        /////////
        let files = partner.files;
        if (files.length) {
            partner.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete partner.files;

        if(partner.files && partner.files.length < 1) delete partner.files;

        partner.updatedBy = req.user._id;
        if(!partner.tag) partner.tag = null;
             
         let partnerData = await PartnerModel.updateOne({ _id: req.params.id }, {$set: partner} );

        if (!partnerData) return res.status(400).json({ error: "partner update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "partner updated succesfully"
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

        await PartnerModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Partner Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

////////////////////////


const createTag = async (req, res, next) => {
    let tag = await FILE_UPLOAD.uploadMultipleFile(req);
        tag.active = true;
    try {
        const schema = Joi.object({
        
            name: Joi.string().required(),  
            sortOrder:Joi.number().empty(''),     
            files: Joi.array(),       
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(tag);
        if (error) return res.status(400).json({ error });

        let files = tag.files;
        if (files.length) {
            tag.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete tag.files;

        tag.createdBy = req.user._id;
        tag.updatedBy = req.user._id;
        
        tag = new PartnerTagModel(tag);
        tag = await tag.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: tag
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const getTag = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        let docs = await PartnerTagModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit);
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateTag = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "Tag id is required" });
        let tag = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            name: Joi.string().required(),    
            sortOrder:Joi.number().empty(''),             
            files: Joi.array(),       
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(tag);
        if (error) return res.status(400).json({ error });

        let files = tag.files;
        if (files.length) {
            tag.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete tag.files;

        if(tag.files && tag.files.length < 1) delete tag.files;
      
        tag.updatedBy = req.user._id;
       
        let tagData = await PartnerTagModel.updateOne({ _id: req.params.id }, {$set: tag} );
        if (!tagData) return res.status(400).json({ error: "Tag update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Tag updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeTag = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await PartnerTagModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Tag Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

///////////////////////////

const pageDetail = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        let record = {};

        query.active = true;
        query.feature = 1;
        query.type = 'PARTNER';

        record.featureList    = await PartnerModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1})
        .populate('file', 'name original path thumbnail smallFile')
        .populate('tag',"_id name")
        ;
        // query['feature']= {$ne:1};
        delete query.feature;
        record.partnerList    = await PartnerModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt: -1})
        .populate('file', 'name original path thumbnail smallFile')
        .populate('tag',"_id name")
        ;
        record.tagList = await PartnerTagModel.find({active:true},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1});
      
        record.meta = await MetaModel.find({active:true,link:'partners'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile');
       

        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

module.exports = {
    create,
    get,
    update,
    remove,
    createTag,
    getTag,
    updateTag,
    removeTag,
    pageDetail       
};