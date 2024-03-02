'use strict';

const modelName                     = 'blog';
const Joi                           = require('@hapi/joi');
const { CaseStudyModel,CaseStudyTagModel }                 = require('@database');
const CONSTANT                      = require('@lib/constant');
const UTILS                         = require('@lib/utils');
const FILE_UPLOAD                   = require('@lib/file_upload');
const sfu                           = require('slug');
const errorHandler = require('errorhandler');
const ObjectId                  = require('mongodb').ObjectId;


const create = async (req, res, next) => {
    let blog = await FILE_UPLOAD.uploadMultipleFile(req);
        // blog.active = true;
    try {
        const schema = Joi.object({
            solutionId: Joi.string().required(),
            solutionServiceId: Joi.string(),
            name: Joi.string().required(),
            shortDescription: Joi.string().empty(''),
            description: Joi.string().empty(''),
            description2: Joi.string().empty(''),
            tag: Joi.array(),
            type:Joi.string().empty(''),
            slug :Joi.string().empty(''),
            link :Joi.string().empty(''),          
            showOnHome: Joi.number().empty(''),
            specification:Joi.array(),
            publish: Joi.string().empty(''),
            files: Joi.array(),         
            metaTitle: Joi.string().empty(''),
            metaKeyword: Joi.string().empty(''),
            metaDescription: Joi.string().empty(''),
            active: Joi.boolean().empty(''),
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
        
        blog = new CaseStudyModel(blog);
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
        let docs = await CaseStudyModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile')
        .populate('thumbnail', 'name original path thumbnail smallFile')
        .populate('solutionId','_id name')
        .populate('solutionServiceId','_id name')

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
        if (!req.params.id) return res.status(400).json({ error: "case id is required" });
        let blog = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            solutionId: Joi.string().required(),
            solutionServiceId: Joi.string(),
            name: Joi.string().required(),
            shortDescription: Joi.string().empty(''),
            description: Joi.string().empty(''),
            description2: Joi.string().empty(''),
            tag: Joi.array(),
            type:Joi.string().empty(''),
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

        if(blog.files && blog.files.length < 1) delete blog.files;
        if(blog.thumbnail && blog.thumbnail.length < 1) delete blog.thumbnail;

        blog.slug = req.body.slug?sfu(req.body.slug):sfu(req.body.name);
        blog.updatedBy = req.user._id;

        if(!blog.tag) blog.tag = null;
        if(!blog.specification) blog.specification = null;
        
        if(!blog.showOnHome) blog.showOnHome = 0;
       
        let blogData = await CaseStudyModel.updateOne({ _id: req.params.id }, {$set: blog} );
        if (!blogData) return res.status(400).json({ error: "Case study update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Case study updated succesfully"
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

        await CaseStudyModel.deleteOne({ _id: req.params.id });
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
        
        tag = new CaseStudyTagModel(tag);
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
        let docs = await CaseStudyTagModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit);
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
       
        let tagData = await CaseStudyTagModel.updateOne({ _id: req.params.id }, {$set: tag} );
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

        await CaseStudyTagModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Tag Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

////////////////////

const tagList = async (req, res, next) => {
    try {
         let limit = '';
         let pagination = '';
        if(req.query.type=='feature'){
            limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
            pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
          
        }else if(req.query.type=='latest'){
            limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
            pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
     
        }else{
            limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
            pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        }
      
        // get blog type id
  
        let blogType = req.query.blogType?req.query.blogType:'blogs';
        let blogTypeDetail = await BlogTypeModel.find({slug:blogType});
 
        // feature blog
        let query = {};
        query['feature']=1;
        query['active'] =true;
        query['blogType'] = blogTypeDetail[0]._id?blogTypeDetail[0]._id:'';
        if(req.query.slug) query['slug'] = req.query.slug;
        // latest blog
        let query2 = {};
        query2['feature']=0;
        query2['active'] =true;
        query2['blogType'] = blogTypeDetail[0]._id?blogTypeDetail[0]._id:'';
        if(req.query.slug) query2['slug'] = req.query.slug;
  
        let record ={};

        if(!req.query.slug){
            record.featureBlogList = await CaseStudyModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
            .populate('file', 'name original path thumbnail smallFile')
            .populate('thumbnail', 'name original path thumbnail smallFile');
    
            record.latestBlogList = await CaseStudyModel.find(query2).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
            .populate('file', 'name original path thumbnail smallFile')
            .populate('thumbnail', 'name original path thumbnail smallFile');

        }else{
            record.detail = await CaseStudyModel.find({active:true,slug:req.query.slug}).populate('file', 'name original path thumbnail smallFile')
            .populate('thumbnail', 'name original path thumbnail smallFile');
        }
        
       

        // single blog elements
      
        if(req.query.slug) {
       
        record.popularCategory = await BlogCategoryModel.find({active:true,blogType:blogTypeDetail[0]._id}).sort({createdAt: -1});

        record.recentBlogs = await CaseStudyModel.find({active:true,blogType:blogTypeDetail[0]._id,_id:{$ne:record.detail[0]._id}}).sort({createdAt: -1}).limit(4)
        .populate('file', 'name original path thumbnail smallFile')
        .populate('thumbnail', 'name original path thumbnail smallFile');

         record.reletedBlogs = await CaseStudyModel.find({active:true,blogType:blogTypeDetail[0]._id,_id:{$ne:record.detail[0]._id},category:ObjectId(record.detail[0].category)}).sort({createdAt: -1}).limit(limit).skip(pagination.limit)
        .populate('file', 'name original path thumbnail smallFile')
        .populate('thumbnail', 'name original path thumbnail smallFile');

        }



        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS ,
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
    tagList
        
};