'use strict';

const modelName                 = 'Service';
const Joi                       = require('@hapi/joi');
const { FinanceModel,FinanceOfferingModel,MetaModel,StoryModel,CaseStudyModel,FinanceHeadingModel
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
           
            shortDescription:Joi.string().empty(''),
            description: Joi.string().empty(''),
            bottomDescription: Joi.string().empty(''),
            ctaDescription: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            files: Joi.array(),
            slug:Joi.string().empty(''),
            metaTitle:Joi.string().empty(''),
            tagLine:Joi.string().empty(''),
            metaKeyword:Joi.string().empty(''),
            metaDescription:Joi.string().empty(''),
            specification:Joi.array(),
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
        service = new FinanceModel(service);
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
            bottomDescription: Joi.string().empty(''),
            ctaDescription: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            files: Joi.array(),
            slug:Joi.string().empty(''),
            metaTitle:Joi.string().empty(''),
            metaKeyword:Joi.string().empty(''),
            tagLine:Joi.string().empty(''),
            specification:Joi.array(),
            metaDescription:Joi.string().empty(''),
            active: Joi.boolean().empty(''),
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
        



        service = await FinanceModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!service) return res.status(400).json({error: "financing update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "financing updated succesfully"
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
        let count = await FinanceModel.countDocuments(query);
        let docs = await FinanceModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile').populate('thumbnail', 'name original path thumbnail smallFile').populate('hoverImage','name original path thumbnail smallFile');
              
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

        await FinanceModel.remove({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
             result: "financing deleted successfully" });
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
            financeId: Joi.string().required(), 
            name: Joi.string().required(),
            shortDescription:Joi.string().empty(''),
            description: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
  
            files: Joi.array(),
       
          
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
        service = new FinanceOfferingModel(service);
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
            financeId: Joi.string().required(), 
            name: Joi.string().required(),
            shortDescription:Joi.string().empty(''),
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

                if(iteam.fieldName== 'blog'){
                    service.thumbnail = files.filter(e => e.fieldName == 'blog').map(file => file._id); 
                }
               
           });         
        }
         delete service.files;
        
        if(service.file && service.file.length < 1) delete service.file;
        if(service.blog && service.blog.length < 1) delete service.blog;
    
        service = await FinanceOfferingModel.updateOne({_id: req.params.id}, {$set: service});
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
        let count = await FinanceOfferingModel.countDocuments();
        
        let docs = await FinanceOfferingModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile').populate('financeId','_id name');
              
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

        await FinanceOfferingModel.remove({ _id: req.params.id });
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

        record.financeList = await FinanceModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).limit(limit).skip(pagination*limit).populate('thumbnail', 'name original path thumbnail smallFile');
              
        // let offering = await FinanceOfferingModel.find({active:true},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).populate('file', 'name original path thumbnail smallFile');
        
        // record.industryList = UTILS.cloneObject(industryList).filter(e => e._id).map(doc => {
        //     doc.offeringList = (offering || []).filter(e => e.industryId && doc._id && e.industryId.toString() == doc._id.toString()) || [];
        //     return doc;
        //    });
        
           record.storyList = await StoryModel.find({active:true},{_id:1,name:1,slug:1,tag:1,link:1,shortDescription:1}).sort({createdAt: -1}).limit(3)
           .populate('thumbnail', 'name original path thumbnail smallFile')
           .populate('tag', '_id name')
           ;
            
 
            record.meta = await MetaModel.find({link:'financing'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile');


            record.heading = await FinanceHeadingModel.findOne({});

        return res.status(200).send({   
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const financeDetail = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;
        let record = {};
        query.active = true;

        record.detail = await FinanceModel.findOne(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile').populate('thumbnail', 'name original path thumbnail smallFile').populate('hoverImage','name original path thumbnail smallFile');

        record.sideMenu = await FinanceModel.find({'$ne':{_id:record.detail._id}},{_id:1,name:1,slug:1});

        if(record.detail._id){

            record.overviewList = await FinanceOfferingModel.find({financeId:record.detail._id},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sort_order: 1}).populate('file', 'name original path thumbnail smallFile').populate('financeId','_id name');

        }
 
        return res.status(200).send({
            status:CONSTANT.REQUESTED_CODES.SUCCESS,
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
      
        let record = await FinanceModel.find(query,{_id:1,name:1}).sort({name: 1});
              
        return res.status(200).send({   
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


//////////////////////////


const createHeading = async (req, res, next) => {
    let service = await FILE_UPLOAD.uploadMultipleFile(req);
   
    try {
      
        const schema = Joi.object({
            title: Joi.string().required(),
            shortDescription:Joi.string().empty(''),
            ctaDescription: Joi.string().empty(''),
            specification:Joi.array(),
            files: Joi.array(),
            customFields: Joi.object(),
            createdBy :Joi.string(),
            
        });
       
        const { error } = schema.validate(service);
        if (error) return res.status(400).json({ error });
      

        if (service.files.length) service.file = service.files.map(file => file._id);
        else delete service.files;

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
        service = new FinanceHeadingModel(service);
        service = await service.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: service
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const updateHeading = async (req, res, next) => {
   
    try {
        if (!req.params.id) return res.status(400).json({error: "service id is required"});
        let service = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            title: Joi.string().required(),
            shortDescription:Joi.string().empty(''),
            ctaDescription: Joi.string().empty(''),
            specification:Joi.array(),
            files: Joi.array(),
            customFields: Joi.object(),
            createdBy :Joi.string(),
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

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
      
        service = await FinanceHeadingModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!service) return res.status(400).json({error: "heading update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "heading updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const getHeading = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        
        if (query.name) query.name = new RegExp(query.name, "i");
      
        delete query.pagination;
        delete query.limit;
        let count = await FinanceHeadingModel.countDocuments();
        
        let docs = await FinanceHeadingModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
              
        return res.status(200).send({   
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs,countData:count });
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

        await FinanceHeadingModel.remove({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
             result: "heading deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

///////////////////////////


const slugList = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
           
        delete query.pagination;
        delete query.limit;
        let record = {};
        query.active = true;

        record = await FinanceModel.find(query,{_id:1,slug:1}).sort({sortOrder: 1}).limit(limit).skip(pagination*limit);

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
    financeDetail,
    createHeading,
getHeading,
updateHeading,
removeHeading,
slugList
    
};