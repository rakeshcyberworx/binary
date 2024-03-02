'use strict';

const Joi                           = require('@hapi/joi');
const { 
    ContactHeadingModel,SettingModel,IndustryModel,
    MetaModel
 }       = require('@database');
const CONSTANT                      = require('@lib/constant');
const UTILS                         = require('@lib/utils');
const FILE_UPLOAD                   = require('@lib/file_upload');
const errorHandler = require('errorhandler');
const ObjectId                  = require('mongodb').ObjectId;


const create = async (req, res, next) => {
    let contact = await FILE_UPLOAD.uploadMultipleFile(req);
        contact.active = true;

    try {
        const schema = Joi.object({
            title: Joi.string().required(),
            description: Joi.string().empty(''),
            termsLine: Joi.string().empty(''),
            termDescription: Joi.string().empty(''),
            doNext: Joi.array(),
            interestList: Joi.array(),
            email: Joi.string().empty(''),
            locationList: Joi.array(),
            files:Joi.array(),
            active: Joi.boolean()
        });

        const { error } = schema.validate(contact);
        if (error) return res.status(400).json({ error });

        let files = contact.files;
        if (files.length) {
                
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    contact.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }    
               
           });
        } else delete contact.files;
        
        contact.createdBy = req.user._id;
        contact.updatedBy = req.user._id;

        contact = new ContactHeadingModel(contact);
        contact = await contact.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: contact
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

        let docs = await ContactHeadingModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit);
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "heading id is required" });
        let contact = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            title: Joi.string().required(),
            description: Joi.string().empty(''),
            termsLine: Joi.string().empty(''),
            termDescription: Joi.string().empty(''),
            doNext: Joi.array(),
            interestList: Joi.array(),
            email: Joi.string().empty(''),
            files:Joi.array(),
            locationList: Joi.array(),
            active: Joi.boolean()
        });

        const { error } = schema.validate(contact);
        if (error) return res.status(400).json({ error });

        let files = contact.files;
        if (files.length) {
                
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    contact.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }
               
           });
        } else delete contact.files;

        if(contact.files && contact.files.length < 1) delete contact.files;

        contact.updatedBy = req.user._id;
       
        let contactData = await ContactHeadingModel.updateOne({ _id: req.params.id }, {$set: contact} );
        if (!contactData) return res.status(400).json({ error: "heading update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "heading updated succesfully"
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

        await ContactHeadingModel.remove({ _id: req.params.id });
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Contact Heading deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const pageDetail = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        let record = { };
        record.heading = await ContactHeadingModel.find({active:1},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile');
     
        record.setting = await SettingModel.find({active:true},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0})
        .populate('logo', 'name original path thumbnail smallFile')
        .populate('footer_logo', 'name original path thumbnail smallFile')
        .populate('favicon', 'name original path thumbnail smallFile')
        .populate('default_logo', 'name original path thumbnail smallFile');
       
        record.industryList = await IndustryModel.find({active:true},{_id:1,name:1}).sort({name: 1});
             

        record.meta = await MetaModel.find({active:true,link:'contact'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile');
       
        
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
    pageDetail
};