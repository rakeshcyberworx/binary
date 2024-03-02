'use strict';

const modelName                 = 'Service';
const Joi                       = require('@hapi/joi');
const { ServiceModel,ServiceOfferingModel,MetaModel,BlogModel
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
            bannerTitle:Joi.string().empty(''),
            bannerDescription:Joi.string().empty(''),
            offeringTitle:Joi.string().empty(''),
            offeringDescription:Joi.string().empty(''),
            whychoseTitle:Joi.string().empty(''),
            whychoseDescription:Joi.string().empty(''),
            description: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            specification:Joi.array(),
            files: Joi.array(),
            slug:Joi.string().empty(''),
            metaTitle:Joi.string().empty(''),
            metaKeyword:Joi.string().empty(''),
            metaDescription:Joi.string().empty(''),
            active: Joi.boolean(),
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
                if(iteam.fieldName== 'carcass'){
                    service.featureImage = files.filter(e => e.fieldName == 'carcass').map(file => file._id); 
                }
                
           });         

        } else delete service.files;
       
        service.createdBy = req.user._id;
        service.updatedBy = req.user._id;
        service = new ServiceModel(service);
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
            offeringTitle:Joi.string().empty(''),
            offeringDescription:Joi.string().empty(''),
            whychoseDescription:Joi.string().empty(''),
            whychoseTitle:Joi.string().empty(''),
            description: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            specification:Joi.array(),
            files: Joi.array(),
            slug:Joi.string().empty(''),
            metaTitle:Joi.string().empty(''),
            metaKeyword:Joi.string().empty(''),
            metaDescription:Joi.string().empty(''),
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
        if(service.carcass && service.carcass.length < 1) delete service.carcass;
        if(!service.specification) service.specification = null;
        service = await ServiceModel.updateOne({_id: req.params.id}, {$set: req.body});
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
        let count = await ServiceModel.countDocuments();
        
        let docs = await ServiceModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile').populate('thumbnail','name original path thumbnail smallFile').populate('featureImage','name original path thumbnail smallFile');
              
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

        await ServiceModel.remove({ _id: req.params.id });
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
   service.active = true;
    
    try {
      
        const schema = Joi.object({
            serviceId: Joi.string().required(), 
            name: Joi.string().required(),
            shortDescription:Joi.string().empty(''),
            description: Joi.string().empty(''),
            title1: Joi.string().empty(''),
            description1: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            specification: Joi.array(),
            whychoose: Joi.array(),
            files: Joi.array(),
            slug:Joi.string().empty(''),
            specification_heading:Joi.string().empty(''),
            offeringDescription:Joi.string().empty(''),
            manageTitle:Joi.string().empty(''),
            manageDescription:Joi.string().empty(''),
            metaTitle:Joi.string().empty(''),
            metaKeyword:Joi.string().empty(''),
            metaDescription:Joi.string().empty(''),
            ctaDescription:Joi.string().empty(''),
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

        service = new ServiceOfferingModel(service);
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
            serviceId: Joi.string().required(), 
            name: Joi.string().required(),
            shortDescription:Joi.string().empty(''),
            description: Joi.string().empty(''),
            title1: Joi.string().empty(''),
            description1: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            specification: Joi.array(),
            whychoose: Joi.array(),
            files: Joi.array(),
            slug:Joi.string().empty(''),
            specification_heading:Joi.string().empty(''),
            offeringDescription:Joi.string().empty(''),
            manageTitle:Joi.string().empty(''),
            manageDescription:Joi.string().empty(''),
            ctaDescription:Joi.string().empty(''),
            metaTitle:Joi.string().empty(''),
            metaKeyword:Joi.string().empty(''),
            metaDescription:Joi.string().empty(''),
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


        service = await ServiceOfferingModel.updateOne({_id: req.params.id}, {$set: req.body});
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
        let count = await ServiceOfferingModel.countDocuments();
        
        let docs = await ServiceOfferingModel.find(query).sort({sortOrder: 1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile')
        .populate('thumbnail', 'name original path thumbnail smallFile')
        .populate('featureImage', 'name original path thumbnail smallFile')
        .populate('serviceId','_id name');
              
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

        await ServiceOfferingModel.remove({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
             result: "Service offering deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

//////////////


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
        let service = await ServiceModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
              
        let offering = await ServiceOfferingModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).populate('file', 'name original path thumbnail smallFile');
              
        let blogList = await BlogModel.find({active:true,type:'BLOGS'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt:-1}).limit(3)
        .populate('file', 'name original path thumbnail smallFile')
        .populate('thumbnail', 'name original path thumbnail smallFile')
        .populate('category', '_id name')
        ;



        if(query._id || query.slug) {
            record.service = service;
            let offering = await ServiceOfferingModel.find({active:true,serviceId:service[0]._id},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).populate('file', 'name original path thumbnail smallFile');
            record.offering = offering;  

            // record.serviceList = await ServiceModel.find({active:true,_id:{$ne:service[0]._id}},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');

        }else{

        record.serviceList = UTILS.cloneObject(service).filter(e => e._id).map(doc => {
            doc.offeringList = (offering || []).filter(e => e.serviceId && doc._id && e.serviceId.toString() == doc._id.toString()) || [];
            return doc;
           });


           record.serviceList = UTILS.cloneObject(record.serviceList).filter(e => e._id).map(doc => {
            doc.blogLists = (blogList || []).filter(e => e.serviceId && doc._id && e.serviceId.toString() == doc._id.toString()) || [];
            return doc;
           });


           



        }
        record.meta = await MetaModel.find({link:'service'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile');

       

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
      
        record.offering = await ServiceOfferingModel.findOne(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile').populate('thumbnail', 'name original path thumbnail smallFile').populate('featureImage', 'name original path thumbnail smallFile');
              
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

const menuList = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        let record = {};
        query.active = true;

        let services = await ServiceModel.find(query,{_id:1,name:1,slug:1}).sort({sortOrder:1});

        let offering = await ServiceOfferingModel.find({active:true},{serviceId:1,_id:1,name:1,slug:1}).sort({sortOrder: 1});

        record = UTILS.cloneObject(services).filter(e => e._id).map(doc => {
            doc.offeringDetail = (offering || []).filter(e => e.serviceId && doc._id && e.serviceId.toString() == doc._id.toString()) || [];
            return doc;
           });     
       
        return res.status(200).send({
            status:CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


//////////////////



const slugServiceList = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
      
        delete query.pagination;
        delete query.limit;
        let record = {} ;
        query.active = true;
        
        record = await ServiceModel.find(query,{slug:1}).sort({sortOrder: 1}).limit(limit).skip(pagination*limit);

        return res.status(200).send({   
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
const slugOfferList = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
      
        delete query.pagination;
        delete query.limit;
        let record = {} ;
        query.active = true;
        
    
         record = await ServiceOfferingModel.find(query,{slug:1}).sort({sortOrder: 1}).limit(limit).skip(pagination*limit);
            
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
    offeringDetail,
    menuList,
    slugServiceList,
    slugOfferList
    
};