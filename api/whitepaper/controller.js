'use strict';

const modelName                     = 'blog';
const Joi                           = require('@hapi/joi');
const { WhitePaperModel,WhitePaperTagModel,MetaModel }                 = require('@database');
const CONSTANT                      = require('@lib/constant');
const UTILS                         = require('@lib/utils');
const FILE_UPLOAD                   = require('@lib/file_upload');
const sfu                           = require('slug');
const errorHandler = require('errorhandler');
const ObjectId                  = require('mongodb').ObjectId;


const create = async (req, res, next) => {
    let blog = await FILE_UPLOAD.uploadMultipleFile(req);
        blog.active = true;
    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            shortDescription: Joi.string().empty(''),
            description: Joi.string().empty(''),
            description2: Joi.string().empty(''),
            tag: Joi.array(),
            topName:Joi.string().empty(''),
            slug :Joi.string().empty(''),
            link :Joi.string().empty(''),          
            showOnHome: Joi.number().empty(''),
            specification:Joi.array(),
            publish: Joi.string().empty(''),
            files: Joi.array(),         
            metaTitle: Joi.string().empty(''),
            metaKeyword: Joi.string().empty(''),
            metaDescription: Joi.string().empty(''),
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(blog);
        if (error) return res.status(400).json({ error });

        let files = blog.files;
        if (files.length) {
                
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    blog.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }
                if(iteam.fieldName== 'blog'){
                    blog.thumbnail = files.filter(e => e.fieldName == 'blog').map(file => file._id); 
                }
               
           });
        } else delete blog.files;

        blog.slug = req.body.slug?sfu(req.body.slug):sfu(req.body.name);

        blog.createdBy = req.user._id;
        blog.updatedBy = req.user._id;
        
        blog = new WhitePaperModel(blog);
        blog = await blog.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: blog
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
        let docs = await WhitePaperModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile')
        .populate('thumbnail', 'name original path thumbnail smallFile')
        .populate('tag', '_id name')
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
        if (!req.params.id) return res.status(400).json({ error: "blog id is required" });
        let blog = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            name: Joi.string().required(),
            shortDescription: Joi.string().empty(''),
            description: Joi.string().empty(''),
            description2: Joi.string().empty(''),
            topName:Joi.string().empty(''),
            tag: Joi.array(),
            publish: Joi.string().empty(''),
            slug :Joi.string().empty(''),
            link :Joi.string().empty(''),          
            showOnHome: Joi.number().empty(''),
            specification:Joi.array(),
            files: Joi.array(),         
            metaTitle: Joi.string().empty(''),
            metaKeyword: Joi.string().empty(''),
            metaDescription: Joi.string().empty(''),
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(blog);
        if (error) return res.status(400).json({ error });

        let files = blog.files;
        if (files.length) {
                
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    blog.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }
                if(iteam.fieldName== 'blog'){
                    blog.thumbnail = files.filter(e => e.fieldName == 'blog').map(file => file._id); 
                }
               
           });
        } else delete blog.files;

        if(blog.files && blog.files.length < 1) delete blog.files;
        if(blog.thumbnail && blog.thumbnail.length < 1) delete blog.thumbnail;

        blog.slug = req.body.slug?sfu(req.body.slug):sfu(req.body.name);
        blog.updatedBy = req.user._id;
       
        let blogData = await WhitePaperModel.updateOne({ _id: req.params.id }, {$set: blog} );
        if (!blogData) return res.status(400).json({ error: "blog update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "blog updated succesfully"
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

        await WhitePaperModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "blog Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

//////////////////


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
        
        tag = new WhitePaperTagModel(tag);
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
        let docs = await WhitePaperTagModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit);
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
       
        let tagData = await WhitePaperTagModel.updateOne({ _id: req.params.id }, {$set: tag} );
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

        await WhitePaperTagModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Tag Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

////////////////////


const pageDetail = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        let record = {};
        query.active = true;

        record.whitePaperList = await WhitePaperModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile')
        .populate('thumbnail', 'name original path thumbnail smallFile')
        .populate('tag', '_id name')
        ;

        record.tagList = await WhitePaperTagModel.find({active:true}).sort({createdAt: -1});

        record.meta = await MetaModel.find({active:true,link:'whitepapers'}).populate('file', 'name original path thumbnail smallFile');
    
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