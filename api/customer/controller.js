'use strict';

const modelName                 = 'Service';
const Joi                       = require('@hapi/joi');
const { ServiceModel,CustomerExperienceModel,MetaModel,BlogModel,CustomerBenafitModel
   }       = require('@database');
const CONSTANT                  = require('@lib/constant');
const UTILS                     = require('@lib/utils');
const FILE_UPLOAD               = require('@lib/file_upload');
const ObjectId                  = require('mongodb').ObjectId;
const _                         = require('lodash');
const  sfu                     = require('slug');



const create = async (req, res, next) => {
    let service = await FILE_UPLOAD.uploadMultipleFile(req);
   service.active = true;
    
    try {
      
        const schema = Joi.object({

            name: Joi.string().required(),
            shortDescription:Joi.string().empty(''),
            description: Joi.string().empty(''),
            title1: Joi.string().empty(''),
            bannerTitle: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            specification: Joi.array(),
            files: Joi.array(),
            slug:Joi.string().empty(''),
            bannerDescription:Joi.string().empty(''),
            offeringDescription:Joi.string().empty(''),
            benafitTitle:Joi.string().empty(''),
            benafitDescription:Joi.string().empty(''),
            metaTitle:Joi.string().empty(''),
            metaKeyword:Joi.string().empty(''),
            metaDescription:Joi.string().empty(''),
            offeringTitle:Joi.string().empty(''),
            processTitle:Joi.string().empty(''),
            processDescription:Joi.string().empty(''),
            formTitle:Joi.string().empty(''),
            formDescription:Joi.string().empty(''),

            active: Joi.boolean(),
            customFields: Joi.object(),
            createdBy :Joi.string(),
            
        });
       
        const { error } = schema.validate(service);
        if (error) return res.status(400).json({ error });
      
        service.slug = req.body.slug?sfu(req.body.slug):sfu(req.body.name);


        let files = service.files;
   
        if (files) {
                        
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    service.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }

                if(iteam.fieldName== 'blog'){
                    service.thumbnail = files.filter(e => e.fieldName == 'blog').map(file => file._id); 
                }
                if(iteam.fieldName== 'carcass'){
                    service.featureImage = files.filter(e => e.fieldName == 'carcass').map(file => file._id); 
                }
               
           });         

        } else delete service.files;
       
        service.createdBy = req.user._id;
        service.updatedBy = req.user._id;


        if(!service.specification) service.specification = [];
        if(!service.whychoose) service.whychoose = [];

        service = new CustomerExperienceModel(service);
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
            description: Joi.string().empty(''),
            title1: Joi.string().empty(''),
            bannerTitle: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            specification: Joi.array(),
            files: Joi.array(),
            slug:Joi.string().empty(''),
            bannerDescription:Joi.string().empty(''),
            offeringDescription:Joi.string().empty(''),
            benafitTitle:Joi.string().empty(''),
            benafitDescription:Joi.string().empty(''),
            metaTitle:Joi.string().empty(''),
            metaKeyword:Joi.string().empty(''),
            metaDescription:Joi.string().empty(''),
            offeringTitle:Joi.string().empty(''),
            processTitle:Joi.string().empty(''),
            processDescription:Joi.string().empty(''),
            formTitle:Joi.string().empty(''),
            formDescription:Joi.string().empty(''),
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
                if(iteam.fieldName== 'carcass'){
                    service.featureImage = files.filter(e => e.fieldName == 'carcass').map(file => file._id); 
                }
               
           });         
        }
         delete service.files;
        
        if(service.file && service.file.length < 1) delete service.file;
        if(service.blog && service.blog.length < 1) delete service.blog;

        if(!service.whychoose) service.whychoose = [];


        service = await CustomerExperienceModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!service) return res.status(400).json({error: "service update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "service offering updated succesfully"
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
        let count = await CustomerExperienceModel.countDocuments();
        
        let docs = await CustomerExperienceModel.find(query).sort({sortOrder: 1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile')
        .populate('thumbnail', 'name original path thumbnail smallFile')
        .populate('featureImage', 'name original path thumbnail smallFile');
              
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

        await CustomerExperienceModel.remove({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
             result: "Service offering deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

//////////////


const createBenafit = async (req, res, next) => {
    let service = await FILE_UPLOAD.uploadMultipleFile(req);
   service.active = true;
    
    try {
      
        const schema = Joi.object({

            name: Joi.string().required(),
            customerId:Joi.string(),
            description: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            files: Joi.array(),
          
            active: Joi.boolean(),
            customFields: Joi.object(),
            createdBy :Joi.string(),
            
        });
       
        const { error } = schema.validate(service);
        if (error) return res.status(400).json({ error });
      
        service.slug = req.body.slug?sfu(req.body.slug):sfu(req.body.name);


        let files = service.files;
   
        if (files) {
                        
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    service.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }

          
               
           });         

        } else delete service.files;
       
        service.createdBy = req.user._id;
        service.updatedBy = req.user._id;


        if(!service.specification) service.specification = [];
        if(!service.whychoose) service.whychoose = [];

        service = new CustomerBenafitModel(service);
        service = await service.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: service
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const updateBenafit = async (req, res, next) => {
   
    try {
        if (!req.params.id) return res.status(400).json({error: "service id is required"});
        let service = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({

            name: Joi.string().required(),
            customerId:Joi.string(),
            description: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            files: Joi.array(),
          
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
               
           });         
        }
         delete service.files;
        
        if(service.file && service.file.length < 1) delete service.file;
        if(service.blog && service.blog.length < 1) delete service.blog;

        if(!service.whychoose) service.whychoose = [];


        service = await CustomerBenafitModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!service) return res.status(400).json({error: "service update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "service offering updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const getBenafit = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        
        if (query.name) query.name = new RegExp(query.name, "i");
      
        delete query.pagination;
        delete query.limit;
        let count = await CustomerBenafitModel.countDocuments();
        
        let docs = await CustomerBenafitModel.find(query).sort({sortOrder: 1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile')
        .populate('customerId', '_id name')
      ;
              
        return res.status(200).send({   
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs,countData:count });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};



const removeBenafit = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await CustomerBenafitModel.remove({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
             result: "Service offering deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


///////////////////////

const pageDetail = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        
        if (query.name) query.name = new RegExp(query.name, "i");
      
        delete query.pagination;
        delete query.limit;
        let record = {} ;
        query.active = true;
    
        let customer = await CustomerExperienceModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile').populate('featureImage', 'name original path thumbnail smallFile');
              
        let benafit = await CustomerBenafitModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).populate('file', 'name original path thumbnail smallFile');
              
        if(query._id || query.slug) {
            record.customer = customer[0];
           
            let benafit = await CustomerBenafitModel.find({active:true,customerId:customer[0]._id},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).populate('file', 'name original path thumbnail smallFile');
            record.benafitList = benafit;  

        }else{

        record.customerList = UTILS.cloneObject(customer).filter(e => e._id).map(doc => {
            doc.benafitList = (benafit || []).filter(e => e.customerId && doc._id && e.customerId.toString() == doc._id.toString()) || [];
            return doc;
           });

        }


        return res.status(200).send({   
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const offeringDetail = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        
        if (query.name) query.name = new RegExp(query.name, "i");
      
        delete query.pagination;
        delete query.limit;
        let record = {} ;
        query.active = true;
      
        record.offering = await CustomerExperienceModel.findOne(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile').populate('thumbnail', 'name original path thumbnail smallFile').populate('featureImage', 'name original path thumbnail smallFile');
              
        record.serviceList = await ServiceModel.find({active:true},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).populate('file', 'name original path thumbnail smallFile');
            

        record.blogList = await BlogModel.find({active:true,type:'BLOGS'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt:-1}).limit(3)
        .populate('file', 'name original path thumbnail smallFile')
        .populate('thumbnail', 'name original path thumbnail smallFile')
        .populate('category', '_id name')
        ;

        return res.status(200).send({   
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};



//////////////////



const slugList = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
      
        delete query.pagination;
        delete query.limit;
        let record = {} ;
        query.active = true;
        
    
         record = await CustomerExperienceModel.find(query,{slug:1}).sort({sortOrder: 1}).limit(limit).skip(pagination*limit);
            
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
    pageDetail,
    offeringDetail,
    slugList,
    createBenafit,
getBenafit,
updateBenafit,
removeBenafit,
    
};