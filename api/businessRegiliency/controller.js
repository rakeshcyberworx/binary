'use strict';

const modelName                     = 'blog';
const Joi                           = require('@hapi/joi');
const { ProductivityModel,WorkModel,StoryModel,MetaModel,CaseStudyModel,BusinessHeadingModel }                 = require('@database');
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
            sortOrder:Joi.number().empty(''),
            files: Joi.array(),         
           
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
        
        blog = new ProductivityModel(blog);
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
        let docs = await ProductivityModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile')
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
            sortOrder:Joi.number().empty(''),
            files: Joi.array(),        
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
       
        let blogData = await ProductivityModel.updateOne({ _id: req.params.id }, {$set: blog} );
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

        await ProductivityModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "blog Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

//////////////////


const createWork = async (req, res, next) => {
    let tag = await FILE_UPLOAD.uploadMultipleFile(req);
        tag.active = true;
    try {
        const schema = Joi.object({
        
            name: Joi.string().required(),  
            shortDescription: Joi.string().empty(''),
            description: Joi.string().empty(''),
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
        
        tag = new WorkModel(tag);
        tag = await tag.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: tag
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const getWork = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        let docs = await WorkModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit);
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateWork = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "work id is required" });
        let tag = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            name: Joi.string().required(),  
            shortDescription: Joi.string().empty(''),
            description: Joi.string().empty(''),
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
       
        let tagData = await WorkModel.updateOne({ _id: req.params.id }, {$set: tag} );
        if (!tagData) return res.status(400).json({ error: "work update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "work updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeWork = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await WorkModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "work Deleted succesfully" 
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
        query.active= true;

        record.productActivityList = await ProductivityModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1})
        .populate('file', 'name original path thumbnail smallFile')
        ;

        record.workList = await WorkModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1});
        
        // record.storyList = await StoryModel.find({active:true},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).limit(3)
        // .populate('file', 'name original path thumbnail smallFile')
        // .populate('thumbnail', 'name original path thumbnail smallFile')
        // .populate('tag', '_id name')
        // ;

        // record.studyList = await CaseStudyModel.find({active:true,type:'STUDY'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt: -1})
        // .populate('file', 'name original path thumbnail smallFile')
        // .populate('thumbnail', 'name original path thumbnail smallFile')
        // .populate('solutionId','_id name')
        // .populate('solutionServiceId','_id name')
        // ;

        record.studyList = await StoryModel.find({active:true},{_id:1,name:1,slug:1,tag:1,link:1,shortDescription:1}).sort({createdAt: -1}).limit(3)
        .populate('thumbnail', 'name original path thumbnail smallFile')
        .populate('tag', '_id name')
        ;

        record.meta = await MetaModel.find({link:'business-resiliency'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile');
        record.heading = await BusinessHeadingModel.find({active:true}).populate('file','name original path thumbnail smallFile');
    
      
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

//////////////////////


const createHeading = async (req, res, next) => {
    let heading = await FILE_UPLOAD.uploadMultipleFile(req);
        heading.active = true;
    try {
        const schema = Joi.object({
        
            partnerName: Joi.string().required(),  
            partnerDescription: Joi.string().empty(''),
            employeeName: Joi.string().empty(''),
            employeeDescription: Joi.string().empty(''),
            clientName: Joi.string().empty(''),
            clientDescription: Joi.string().empty(''),
            caseName: Joi.string().empty(''),
            caseDescription: Joi.string().empty(''),  
            files: Joi.array(),       
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(heading);
        if (error) return res.status(400).json({ error });

        let files = heading.files;
        if (files.length) {
            heading.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete heading.files;

        heading.createdBy = req.user._id;
        heading.updatedBy = req.user._id;
        
        heading = new BusinessHeadingModel(heading);
        heading = await heading.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: heading
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const getHeading = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        let docs = await BusinessHeadingModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit);
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateHeading = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "Heading id is required" });
        let heading = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            partnerName: Joi.string().required(),  
            partnerDescription: Joi.string().empty(''),
            employeeName: Joi.string().empty(''),
            employeeDescription: Joi.string().empty(''),
            clientName: Joi.string().empty(''),
            clientDescription: Joi.string().empty(''),
            caseName: Joi.string().empty(''),
            caseDescription: Joi.string().empty(''),  
            files: Joi.array(),       
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(heading);
        if (error) return res.status(400).json({ error });

        let files = heading.files;
        if (files.length) {
            heading.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete heading.files;

        if(heading.files && heading.files.length < 1) delete heading.files;
      
        heading.updatedBy = req.user._id;
       
        let headingData = await BusinessHeadingModel.updateOne({ _id: req.params.id }, {$set: heading} );
        if (!headingData) return res.status(400).json({ error: "Heading update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Heading updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeHeading = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await BusinessHeadingModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Heading Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};








module.exports = {
    create,
    get,
    update,
    remove,
    createWork,
    getWork,
    updateWork,
    removeWork,
    pageDetail,
    createHeading,
    getHeading,
    updateHeading,
    removeHeading
        
};