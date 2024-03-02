'use strict';

const modelName                     = 'blog';
const Joi                           = require('@hapi/joi');
const { StoryModel,StoryTagModel,MetaModel,SideStoryMenu }                 = require('@database');
const CONSTANT                      = require('@lib/constant');
const UTILS                         = require('@lib/utils');
const FILE_UPLOAD                   = require('@lib/file_upload');
const sfu                           = require('slug');
const errorHandler = require('errorhandler');
const ObjectId                  = require('mongodb').ObjectId;


const create = async (req, res, next) => {
    let blog = await FILE_UPLOAD.uploadMultipleFile(req);

    try {
        const schema = Joi.object({
            // type:Joi.string().required(),
            solutionId: Joi.string().empty(''),
            solutionServiceId: Joi.string().empty(''),
            name: Joi.string().required(),
            shortDescription: Joi.string().empty(''),
            description: Joi.string().empty(''),
            description2: Joi.string().empty(''),
            tag: Joi.array(),

            whyTitle :Joi.string().empty(''),
            whyHeading :Joi.string().empty(''),
            whyDescription :Joi.string().empty(''),

        
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
                if(iteam.fieldName== 'banner'){
                    blog.whyImage = files.filter(e => e.fieldName == 'banner').map(file => file._id); 
                }
               
           });
        } else delete blog.files;

        blog.slug = req.body.slug?sfu(req.body.slug):sfu(req.body.name);

        blog.createdBy = req.user._id;
        blog.updatedBy = req.user._id;

        blog = new StoryModel(blog);
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
        let docs = await StoryModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile')
        .populate('thumbnail', 'name original path thumbnail smallFile')
        .populate('whyImage', 'name original path thumbnail smallFile')
        .populate('tag', '_id name')
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
        if (!req.params.id) return res.status(400).json({ error: "story id is required" });
        let blog = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            // type:Joi.string().required(),
            solutionId: Joi.string().empty(''),
            solutionServiceId: Joi.string().empty(''),
            name: Joi.string().required(),
            shortDescription: Joi.string().empty(''),
            description: Joi.string().empty(''),
            description2: Joi.string().empty(''),
            tag: Joi.array(),
        
            whyTitle :Joi.string().empty(''),
            whyHeading :Joi.string().empty(''),
            whyDescription :Joi.string().empty(''),

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
                if(iteam.fieldName== 'banner'){
                    blog.whyImage = files.filter(e => e.fieldName == 'banner').map(file => file._id); 
                }
               
           });
        } else delete blog.files;

        if(blog.files && blog.files.length < 1) delete blog.files;
        if(blog.thumbnail && blog.thumbnail.length < 1) delete blog.thumbnail;
        if(blog.whyImage && blog.whyImage.length < 1) delete blog.whyImage;

        blog.slug = req.body.slug?sfu(req.body.slug):sfu(req.body.name);
        blog.updatedBy = req.user._id;
       
        if(!blog.tag) blog.tag = null;
        if(!blog.specification) blog.specification = null;
        
        if(!blog.showOnHome) blog.showOnHome = 0;

        let blogData = await StoryModel.updateOne({ _id: req.params.id }, {$set: blog} );
        if (!blogData) return res.status(400).json({ error: "story update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "story updated succesfully"
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

        await StoryModel.deleteOne({ _id: req.params.id });
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
        
        tag = new StoryTagModel(tag);
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
        let docs = await StoryTagModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit);
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
       
        let tagData = await StoryTagModel.updateOne({ _id: req.params.id }, {$set: tag} );
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

        await StoryTagModel.deleteOne({ _id: req.params.id });
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
        
        if(!query.slug){
            record.tagList = await StoryTagModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0,sortOrder:0,active:0}).sort({sortOrder: 1});
        
            record.storyList = await StoryModel.find(query,{_id:1,name:1,slug:1,tag:1,link:1,shortDescription:1}).sort({createdAt: -1})
            .populate('thumbnail', 'name original path thumbnail smallFile')
            .populate('tag','_id name')
            ;
            record.meta = await MetaModel.find({link:'success-story'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile');
        }else{

            record.storyList = await StoryModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt: -1})
            .populate('file', 'name original path thumbnail smallFile')
            .populate('thumbnail', 'name original path thumbnail smallFile')
            .populate('whyImage', 'name original path thumbnail smallFile')
            .populate('tag','_id name')
            ;
            record.sidebar = await SideStoryMenu.find({active:true},{createdAt:0,updatedAt:0,active:0}).sort({sortOrder: 1});
            record.meta = await MetaModel.find({link:'success-story'},{title2:1,description2:1,title3:1});
        }
     
    


        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


//////////////////////////
const slugList = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        let record = {};
        
            record = await StoryModel.find(query,{_id:1,slug:1}).sort({createdAt: -1}).limit(limit).skip(pagination*limit)  ;

        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
/////////////////////


const createSidemenu = async (req, res, next) => {
    let sidemenu = await FILE_UPLOAD.uploadMultipleFile(req);
        sidemenu.active = true;
    try {
        const schema = Joi.object({
        
            name: Joi.string().required(),  
            link: Joi.string().required(), 
            sortOrder:Joi.number().empty(''),     
            files: Joi.array(),       
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(sidemenu);
        if (error) return res.status(400).json({ error });

        let files = sidemenu.files;
        if (files.length) {
            sidemenu.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete sidemenu.files;

        sidemenu.createdBy = req.user._id;
        sidemenu.updatedBy = req.user._id;
        
        sidemenu = new SideStoryMenu(sidemenu);
        sidemenu = await sidemenu.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: sidemenu
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const getSidemenu = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        let docs = await SideStoryMenu.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit);
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateSidemenu = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "id is required" });
        let sidemenu = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            name: Joi.string().required(),  
            link: Joi.string().required(), 
            sortOrder:Joi.number().empty(''),     
            files: Joi.array(),       
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(sidemenu);
        if (error) return res.status(400).json({ error });

        let files = sidemenu.files;
        if (files.length) {
            sidemenu.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete sidemenu.files;

        if(sidemenu.files && sidemenu.files.length < 1) delete sidemenu.files;
      
        sidemenu.updatedBy = req.user._id;
       
        let sidemenuData = await SideStoryMenu.updateOne({ _id: req.params.id }, {$set: sidemenu} );
        if (!sidemenuData) return res.status(400).json({ error: "sidemenu update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "sidemenu updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeSidemenu = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await SideStoryMenu.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "sidemenu Deleted succesfully" 
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
    createTag,
    getTag,
    updateTag,
    removeTag,
    pageDetail,
    createSidemenu,
    getSidemenu,
    updateSidemenu,
    removeSidemenu,
    slugList
        
};