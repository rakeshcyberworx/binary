'use strict';

const modelName                     = 'blog';
const Joi                           = require('@hapi/joi');
const { BlogModel,BlogCategoryModel,MetaModel }                 = require('@database');
const CONSTANT                      = require('@lib/constant');
const UTILS                         = require('@lib/utils');
const FILE_UPLOAD                   = require('@lib/file_upload');
const sfu                           = require('slug');
const errorHandler = require('errorhandler');
const { del } = require('request');
const { number } = require('joi');
const ObjectId                  = require('mongodb').ObjectId;

const create = async (req, res, next) => {
    let blog = await FILE_UPLOAD.uploadMultipleFile(req);
        blog.active = true;
    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            shortDescription: Joi.string().empty(''),
            description: Joi.string().empty(''),
            category: Joi.array().empty(''),
            slug :Joi.string().empty(''),
            solutionId :Joi.string().empty(''),
            serviceId :Joi.string().empty(''),
            link :Joi.string().empty(''),          
            feature: Joi.number().empty(''),
            type:Joi.string().empty(''),
            location:Joi.string().empty(''),
            eventType:Joi.string().empty(''),
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

        if(!blog.category) blog.category = null;
        if(!blog.eventType) blog.eventType = null;
        if(!blog.solutionId) blog.solutionId = null;
        if(!blog.serviceId) blog.serviceId = null;
        if(!blog.feature) blog.feature = 0;   
        
        blog = new BlogModel(blog);
        blog = await blog.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: blog
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const blogList = async (req, res, next) => {
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
      
        let type = req.query.type?req.query.type:'BLOGS';
  
        let record ={};
        let count = 0;
    
        if(!req.query.slug){


            if(type=='BLOGS'){
                let query = {};
                query = req.body;
                query['active'] =true;
                query['type'] = type;
                if(req.query.slug) query['slug'] = req.query.slug;
       
                if(req.query.category) {
                  let  $cat = req.query.category.split(',');
                    query['category'] = {
                        '$in':$cat
                    }
                }

                record.BlogList = await BlogModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
                .populate('file', 'name original path thumbnail smallFile')
                .populate('thumbnail', 'name original path thumbnail smallFile');

                delete query.slug;
                delete query.$in;
                delete query.type;
                query['parent'] = null;
                query.active = true;

               let parentBlogCategory = await BlogCategoryModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({name: 1});

                query['parent'] = {$exists: true};
                let  childBlogCategory = await BlogCategoryModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({name: 1});

                record.categoryList = UTILS.cloneObject(parentBlogCategory).filter(e => e._id).map(doc => {
                    doc.ChildCategory = (childBlogCategory || []).filter(e => e.parent && doc._id && e.parent == doc._id) || [];
                    return doc;
                   });

                record.meta = await MetaModel.findOne({active:true,link:'blogs'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile');
                count = await BlogModel.countDocuments(query);  

            }

            if(type=='EVENTS'){

                let query = {};
                query['active'] =true;
                query['type'] = type;
                query['eventType'] = 'UPCOMING';
                // if(req.query.eventType) query['eventType'] = req.query.eventType;
          
                 record.upcomingEvents = await BlogModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
                .populate('file', 'name original path thumbnail smallFile')
                .populate('thumbnail', 'name original path thumbnail smallFile');  

                query['eventType'] = 'PAST';
                record.recentEvents = await BlogModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
                .populate('file', 'name original path thumbnail smallFile')
                .populate('thumbnail', 'name original path thumbnail smallFile');   
                record.meta = await MetaModel.findOne({active:true,link:'events'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile');
                count = await BlogModel.countDocuments(query);                

            }
                                
            if(type=='PRESS'){

                let query = {};
                query['active'] =true;
                query['type'] = type;
                query['feature'] =1
          
                 record.featureList = await BlogModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
                .populate('file', 'name original path thumbnail smallFile')
                .populate('thumbnail', 'name original path thumbnail smallFile');  

                query['feature'] = {$ne:1}
                record.pressList = await BlogModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
                .populate('file', 'name original path thumbnail smallFile')
                .populate('thumbnail', 'name original path thumbnail smallFile');   

                record.meta = await MetaModel.findOne({active:true,link:'press-release'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile');

                count = await BlogModel.countDocuments(query);                

            }

        }
        
       
        // single blog elements
      
        if(req.query.slug) {
       
            if(type=='BLOGS'){
                let query = req.query
                query['active'] =true;

                 record.detail = await BlogModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
                .populate('file', 'name original path thumbnail smallFile')
                .populate('thumbnail', 'name original path thumbnail smallFile');    

                delete query.slug;
        
                if(record.detail[0]._id) query['_id'] = {$ne:record.detail[0]._id}

                record.relatedList = await BlogModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
                .populate('file', 'name original path thumbnail smallFile')
                .populate('thumbnail', 'name original path thumbnail smallFile');
  

            }

            if(type=='EVENTS'){

                let query = req.query
                query['active'] =true;
                query['type'] = type;
                     
                 record = await BlogModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
                .populate('file', 'name original path thumbnail smallFile')
                .populate('thumbnail', 'name original path thumbnail smallFile');    

                count = await BlogModel.countDocuments(query);                

            }
                                
            if(type=='PRESS'){

                let query = req.query
                query['active'] =true;
                query['type'] = type;
                   
                 record = await BlogModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
                .populate('file', 'name original path thumbnail smallFile')
                .populate('thumbnail', 'name original path thumbnail smallFile');               

            }
        

        }



        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS ,
            result: record ,
            count: count
        
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const slugList = async (req, res, next) => {
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
      
        let type = req.query.type?req.query.type:'BLOGS';
  
        let record ={};

        if(!req.query.slug){


            if(type=='BLOGS'){
                let query = {};
                query = req.body;
                query['active'] =true;
                query['type'] = type;
         
                if(req.query.category) {
                  let  $cat = req.query.category.split(',');
                    query['category'] = {
                        '$in':$cat
                    }
                }


                record = await BlogModel.find(query,{_id:1,slug:1}).sort({createdAt: -1}).limit(limit).skip(pagination*limit);

            }

            if(type=='EVENTS'){

                let query = {};
                query['active'] =true;
                query['type'] = type;
               
          
                 record = await BlogModel.find(query,{_id:1,slug:1}).sort({createdAt: -1}).limit(limit).skip(pagination*limit);         

            }
                                
            if(type=='PRESS'){

                let query = {};
                query['active'] =true;
                query['type'] = type;
          
                 record = await BlogModel.find(query,{_id:1,slug:1}).sort({createdAt: -1}).limit(limit).skip(pagination*limit);  
                     

            }

        }
        
    
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS ,
            result: record      
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const get = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;

        if (query.search) {
            query['$or'] = [
                {name: new RegExp(query.search, "i")}
            ];
        }
        delete query.pagination;
        delete query.limit;
        delete query.search;
        
        let docs = await BlogModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile')
        .populate('thumbnail', 'name original path thumbnail smallFile')
        .populate('category', '_id name')
        .populate('serviceId', '_id name')
        .populate('solutionId', '_id name')
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
            solutionId :Joi.string().empty(''),
            serviceId :Joi.string().empty(''),
            category: Joi.array().empty(''),
            publish: Joi.string().empty(''),
            eventType:Joi.string().empty(''),
            type:Joi.string().empty(''),
            slug :Joi.string().empty(''),
            link :Joi.string().empty(''),      
            location:Joi.string().empty(''),    
            feature: Joi.number().empty(''),
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

        if(!blog.category) blog.category = null;
        if(!blog.eventType) blog.eventType = null;
        if(!blog.feature) blog.feature = 0; 

        if(!blog.solutionId) blog.solutionId = null;
        if(!blog.serviceId) blog.serviceId = null;
       
        let blogData = await BlogModel.updateOne({ _id: req.params.id }, {$set: blog} );
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

        await BlogModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "blog Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

//////////////////


const createCategory = async (req, res, next) => {
    let blog = await FILE_UPLOAD.uploadMultipleFile(req);
        blog.active = true;
    try {
        const schema = Joi.object({
        
            name: Joi.string().required(),
            description: Joi.string().empty(''),
            parent: Joi.string().empty(''),
            slug :Joi.string().empty(''),          
            files: Joi.array(),       
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(blog);
        if (error) return res.status(400).json({ error });

        let files = blog.files;
        if (files.length) {
            blog.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
            blog.thumbnail = files.filter(e => e.fieldName == 'blog').map(file => file._id);
        } else delete blog.files;

        blog.slug = req.body.slug?sfu(req.body.slug):sfu(req.body.name);

        blog.createdBy = req.user._id;
        blog.updatedBy = req.user._id;

        if(!blog.parent) blog.parent = null

        
        blog = new BlogCategoryModel(blog);
        blog = await blog.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: blog
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const getCategory = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        let docs = await BlogCategoryModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile').populate('parent','_id name')
 
        ;
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateCategory = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "blog id is required" });
        let blog = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            name: Joi.string().required(),
            description: Joi.string().empty(''),
            parent: Joi.string().empty(''),
            slug :Joi.string().empty(''),          
            files: Joi.array(),       
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(blog);
        if (error) return res.status(400).json({ error });

        let files = blog.files;
        if (files.length) {
            blog.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete blog.files;

        if(blog.files && blog.files.length < 1) delete blog.files;
      
        blog.slug = req.body.slug?sfu(req.body.slug):sfu(req.body.name);
        blog.updatedBy = req.user._id;
        if(!blog.parent) blog.parent = null
       
        let blogData = await BlogCategoryModel.updateOne({ _id: req.params.id }, {$set: blog} );
        if (!blogData) return res.status(400).json({ error: "blog update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "blog updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeCategory = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await BlogCategoryModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "blog Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

////////////////////




module.exports = {
    create,
    get,
    update,
    remove,
    createCategory,
    getCategory,
    updateCategory,
    removeCategory,
    blogList,
    slugList
    
};