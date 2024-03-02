'use strict';

const modelName                 = 'Service';
const Joi                       = require('@hapi/joi');
const { IndustryModel,IndustryOfferingModel,MetaModel,StoryModel
   }       = require('@database');
const CONSTANT                  = require('@lib/constant');
const UTILS                     = require('@lib/utils');
const FILE_UPLOAD               = require('@lib/file_upload');
const ObjectId                  = require('mongodb').ObjectId;
const _                         = require('lodash');
const  sfu                     = require('slug');

const create = async (req, res, next) => {
    let service = await FILE_UPLOAD.uploadMultipleFile(req);
//    service.active = true;
    
    try {
      
        const schema = Joi.object({
            name: Joi.string().required(),
            bannerTitle:Joi.string().empty(''),
            bannerDescription:Joi.string().empty(''),
            bestTitle:Joi.string().empty(''),
            bestDescription:Joi.string().empty(''),
            bestPractice:Joi.array(),
            shortDescription:Joi.string().empty(''),
            ctaDescription:Joi.string().empty(''),
            description: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            files: Joi.array(),
            slug:Joi.string().empty(''),
            metaTitle:Joi.string().empty(''),
            metaKeyword:Joi.string().empty(''),
            metaDescription:Joi.string().empty(''),
            serviceTitle:Joi.string().empty(''),
            serviceDescription:Joi.string().empty(''),
            offerings:Joi.array(),
            solutionService:Joi.array(),
            solutionList:Joi.array(),
            serviceList:Joi.array(),
            counters:Joi.array().empty(''),
            active: Joi.boolean().empty(''),
            customFields: Joi.object(),
            createdBy :Joi.string(),
            
        });
       
        const { error } = schema.validate(service);
        if (error) return res.status(400).json({ error });
      
        service.slug = req.body.slug?sfu(req.body.slug):sfu(req.body.name);

        if (service.files.length) service.file = service.files.map(file => file._id);
        else delete service.files;

        let files = service.files;
   
        if (files) {
                        
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    service.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }

                if(iteam.fieldName== 'blog'){
                    service.thumbnail = files.filter(e => e.fieldName == 'blog').map(file => file._id); 
                }
                if(iteam.fieldName== 'coverPhoto'){
                    service.hoverImage = files.filter(e => e.fieldName == 'coverPhoto').map(file => file._id); 
                }
               
           });         

        } else delete service.files;
       
        service.createdBy = req.user._id;
        service.updatedBy = req.user._id;
        service = new IndustryModel(service);
        service = await service.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: service
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const update = async (req, res, next) => {
   
    try {
        if (!req.params.id) return res.status(400).json({error: "service id is required"});
        let service = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            name: Joi.string().required(),
            shortDescription:Joi.string().empty(''),
            bannerTitle:Joi.string().empty(''),
            bannerDescription:Joi.string().empty(''),
            bestTitle:Joi.string().empty(''),
            bestDescription:Joi.string().empty(''),
            ctaDescription:Joi.string().empty(''),
            bestPractice:Joi.array(),
            description: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            files: Joi.array(),
            slug:Joi.string().empty(''),
            metaTitle:Joi.string().empty(''),
            metaKeyword:Joi.string().empty(''),
            metaDescription:Joi.string().empty(''),
            serviceTitle:Joi.string().empty(''),
            serviceDescription:Joi.string().empty(''),
            offerings:Joi.array(),
            solutionService:Joi.array(),
            solutionList:Joi.array(),
            serviceList:Joi.array(),
            counters:Joi.array(),
            active: Joi.boolean(),
            customFields: Joi.object(),
            createdBy :Joi.string(),
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        service.slug = req.body.slug?sfu(req.body.slug):sfu(req.body.name);
        service.updatedBy = req.user._id;
 
        let files = service.files;
        if (files) {      
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    service.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }

                if(iteam.fieldName== 'blog'){
                    service.thumbnail = files.filter(e => e.fieldName == 'blog').map(file => file._id); 
                }
                if(iteam.fieldName== 'coverPhoto'){
                    service.hoverImage = files.filter(e => e.fieldName == 'coverPhoto').map(file => file._id); 
                }
               
           });         
        }
         delete service.files;
        
        if(service.file && service.file.length < 1) delete service.file;
        if(service.blog && service.blog.length < 1) delete service.blog;
        if(service.coverPhoto && service.coverPhoto.length < 1) delete service.coverPhoto;


        if(!service.bestPractice){service.bestPractice =''}

        if(!service.counters) service.counters =[];
        if(!service.offerings) service.offerings =[];
        if(!service.solutionService) service.solutionService =[];
        if(!service.solutionList) service.solutionList =[];
        if(!service.serviceList) service.serviceList =[];

    
        service = await IndustryModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!service) return res.status(400).json({error: "service update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "service updated succesfully"
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
        
        if (query.name) query.name = new RegExp(query.name, "i");
      
        delete query.pagination;
        delete query.limit;
        let count = await IndustryModel.countDocuments(query);
        let docs = await IndustryModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile').populate('thumbnail', 'name original path thumbnail smallFile').populate('offerings', '_id name').populate('solutionService', '_id name').populate('serviceList', '_id name').populate('solutionList', '_id name').populate('hoverImage','name original path thumbnail smallFile');
              
        return res.status(200).send({   
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs,countData:count });
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

        await IndustryModel.remove({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
             result: "Service deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
////////////////////////

const createOffering = async (req, res, next) => {
    let service = await FILE_UPLOAD.uploadMultipleFile(req);
//    service.active = true;
    
    try {
      
        const schema = Joi.object({
            industryId: Joi.string().required(), 
            name: Joi.string().required(),
            shortDescription:Joi.string().empty(''),
            description: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            specification: Joi.array(),
            files: Joi.array(),
            slug:Joi.string().empty(''),
            metaTitle:Joi.string(),
            metaKeyword:Joi.string(),
            metaDescription:Joi.string(),
            active: Joi.boolean().empty(''),
            customFields: Joi.object(),
            createdBy :Joi.string(),
            
        });
       
        const { error } = schema.validate(service);
        if (error) return res.status(400).json({ error });
      
        service.slug = req.body.slug?sfu(req.body.slug):sfu(req.body.name);

        if (service.files.length) service.file = service.files.map(file => file._id);
        else delete service.files;

        let files = service.files;
   
        if (files) {
                        
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    service.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }

                if(iteam.fieldName== 'blog'){
                    service.thumbnail = files.filter(e => e.fieldName == 'blog').map(file => file._id); 
                }
               
           });         

        } else delete service.files;
       
        service.createdBy = req.user._id;
        service.updatedBy = req.user._id;
        service = new IndustryOfferingModel(service);
        service = await service.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: service
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const updateOffering = async (req, res, next) => {
   
    try {
        if (!req.params.id) return res.status(400).json({error: "service id is required"});
        let service = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            industryId: Joi.string().required(), 
            name: Joi.string().required(),
            shortDescription:Joi.string().empty(''),
            description: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            specification: Joi.array(),
            files: Joi.array(),
            slug:Joi.string().empty(''),
            metaTitle:Joi.string().empty(''),
            metaKeyword:Joi.string().empty(''),
            metaDescription:Joi.string(),
            active: Joi.boolean(),
            customFields: Joi.object(),
            createdBy :Joi.string(),
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        service.slug = req.body.slug?sfu(req.body.slug):sfu(req.body.name);
        service.updatedBy = req.user._id;
 
        let files = service.files;
        if (files) {      
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    service.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }

                if(iteam.fieldName== 'blog'){
                    service.thumbnail = files.filter(e => e.fieldName == 'blog').map(file => file._id); 
                }
               
           });         
        }
         delete service.files;
        
        if(service.file && service.file.length < 1) delete service.file;
        if(service.blog && service.blog.length < 1) delete service.blog;
    
        service = await IndustryOfferingModel.updateOne({_id: req.params.id}, {$set: service});
        if (!service) return res.status(400).json({error: "service update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "service offering updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const getOffering = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        
        if (query.name) query.name = new RegExp(query.name, "i");
      
        delete query.pagination;
        delete query.limit;
        let count = await IndustryOfferingModel.countDocuments();
        
        let docs = await IndustryOfferingModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile').populate('industryId','_id name');
              
        return res.status(200).send({   
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs,countData:count });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};



const removeOffering = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await IndustryOfferingModel.remove({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
             result: "Service offering deleted successfully" });
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
        let record = {};
        query.active = true;

        record.industryList = await IndustryModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).limit(limit).skip(pagination*limit).populate('thumbnail', 'name original path thumbnail smallFile').populate('file', 'name original path thumbnail smallFile').populate('hoverImage', 'name original path thumbnail smallFile').populate('offerings','').populate('solutionService','').populate('solutionList','').populate('serviceList','');
              
        // let offering = await IndustryOfferingModel.find({active:true},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).populate('file', 'name original path thumbnail smallFile');
        
        // record.industryList = UTILS.cloneObject(industryList).filter(e => e._id).map(doc => {
        //     doc.offeringList = (offering || []).filter(e => e.industryId && doc._id && e.industryId.toString() == doc._id.toString()) || [];
        //     return doc;
        //    });
        
           record.storyList = await StoryModel.find({active:true},{_id:1,name:1,slug:1,tag:1,link:1,shortDescription:1}).sort({createdAt: -1}).limit(3)
           .populate('thumbnail', 'name original path thumbnail smallFile')
           .populate('tag', '_id name')
           ;
           
        //    if(!query.slug){
            record.meta = await MetaModel.find({link:'industries'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile');
        //    }
       

        return res.status(200).send({   
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};




const list = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        query.active = true;
        
        delete query.pagination;
        delete query.limit;
      
        let record = await IndustryModel.find(query,{_id:1,name:1}).sort({name: 1});
              
        return res.status(200).send({   
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
      

const slugList = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
           
        delete query.pagination;
        delete query.limit;
        let record = {};
        query.active = true;

        record = await IndustryModel.find(query,{_id:1,slug:1}).sort({sortOrder: 1}).limit(limit).skip(pagination*limit);
       

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
    createOffering,
    getOffering,
    updateOffering,
    removeOffering,
    pageDetail,
    list,
    slugList
    
};