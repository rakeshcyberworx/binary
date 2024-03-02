'use strict';

const modelName                 = 'Solution';
const Joi                       = require('@hapi/joi');
const { SolutionModel,SolutionServiceModel,SolutionOverviewModel,
    MetaModel,BlogModel,CaseStudyModel,StoryModel,SolutionHomeModel,SolutionHomeListModel }         = require('@database');
const CONSTANT                  = require('@lib/constant');
const UTILS                     = require('@lib/utils');
const FILE_UPLOAD               = require('@lib/file_upload');
const sfu                       = require('slug');
const { Query } = require('mongoose');
const { count } = require('../../database/models/solutionServiceModel');

const create = async (req, res, next) => {
    let solution = await FILE_UPLOAD.uploadMultipleFile(req);
    solution.active = true;

    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            bannerTitle: Joi.string().empty(''),
            bannerDescription: Joi.string().empty(''),
            description:Joi.string().empty(''),
            shortDescription:Joi.string().empty(''),
            hideHome:Joi.boolean(),
            sortOrder:Joi.number().empty(''),
            slug: Joi.string(),
            active: Joi.boolean(),
            files: Joi.array(),
            metaTitle:Joi.string().empty(''),
            metaKeyword:Joi.string().empty(''),
            metaDescription:Joi.string().empty(''),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(solution);
        if (error) return res.status(400).json({ error });
      
        let files = solution.files;
        if (files) {      
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    solution.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }
               
           });         
        }
         delete solution.files;

        solution.slug = req.body.slug?sfu(req.body.slug):sfu(req.body.name);

        solution.createdBy = req.user._id;
        solution.updatedBy = req.user._id;

        solution = new SolutionModel(solution);
        solution = await solution.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: solution
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
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;

        let docs = await SolutionModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "solution id is required"});
        let solution = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            name: Joi.string().required(),
            bannerTitle: Joi.string().empty(''),
            bannerDescription: Joi.string().empty(''),
            hideHome:Joi.boolean(),
            description:Joi.string().empty(''),
            shortDescription:Joi.string().empty(''),
            sortOrder:Joi.number().empty(''),
            slug: Joi.string().empty(''),
            active: Joi.boolean(),
            files: Joi.array(),
            metaTitle:Joi.string().empty(''),
            metaKeyword:Joi.string().empty(''),
            metaDescription:Joi.string().empty(''),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        let files = solution.files;
        if (files) {      
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    solution.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }
               
           });         
        }
         delete solution.files;
        
        if(solution.file && solution.file.length < 1) delete solution.file;

        req.body.updatedBy = req.user._id;

        solution.slug = req.body.slug?sfu(req.body.slug):sfu(req.body.name);
 
        
        solution = await SolutionModel.updateOne({_id: req.params.id}, {$set: solution});
        if (!solution) return res.status(400).json({error: "solution update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "solution updated succesfully"
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

        await SolutionModel.deleteOne({_id: req.params.id});
        return res.status(200).send({ result: "solution deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
////////////////////////////////
// solution service
const createServices = async (req, res, next) => {
    let service = await FILE_UPLOAD.uploadMultipleFile(req);
   service.active = true;
    
    try {
      
        const schema = Joi.object({
            solutionId: Joi.string().required(), 
            name: Joi.string().required(),
            shortDescription:Joi.string().empty(''),
            description: Joi.string().empty(''),
            innerDescription: Joi.string().empty(''),
            ctaDescription: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            files: Joi.array(),
            slug:Joi.string().empty(''),
            imagePosition:Joi.string().empty(''),
            imageWidth:Joi.string().empty(''),
            overViewTitle:Joi.string().empty(''),
            overViewDescription: Joi.string().empty(''),
            caseTitle:Joi.string().empty(''),
            caseDescription:Joi.string().empty(''),
            isHidden:Joi.boolean().empty(''),
            children:Joi.array().empty(''),
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

        if(service.slug){
            let check = await SolutionServiceModel.findOne({slug:service.slug});
           if(check) service.slug = service.slug+1;
       }    


        service = new SolutionServiceModel(service);
        service = await service.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: service
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const updateServices = async (req, res, next) => {
   
    try {
        if (!req.params.id) return res.status(400).json({error: "service id is required"});
        let service = await FILE_UPLOAD.uploadMultipleFile(req);

        const schema = Joi.object({
            solutionId: Joi.string().required(), 
            name: Joi.string().required(),
            shortDescription:Joi.string().empty(''),
            innerDescription: Joi.string().empty(''),
            ctaDescription: Joi.string().empty(''),
            description: Joi.string().empty(''),
            imagePosition:Joi.string().empty(''),
            imageWidth:Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            overViewTitle:Joi.string().empty(''),
            overViewDescription: Joi.string().empty(''),
            caseTitle:Joi.string().empty(''),
            caseDescription:Joi.string().empty(''),
            isHidden:Joi.boolean().empty(''),
            children:Joi.array().empty(''),
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
        if (files.length) {      
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
       
        if(!service.children) service.children = [];

        if(service.slug){
            let check = await SolutionServiceModel.findOne({slug:service.slug,_id:{'$ne':req.params.id}});
           if(check) service.slug = service.slug+1;
       }    


        service = await SolutionServiceModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!service) return res.status(400).json({error: "service update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "service updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const getServices = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
      
        if (query.name) query.name = new RegExp(query.name, "i");
      
        delete query.pagination;
        delete query.limit;
       
        let count = await SolutionServiceModel.countDocuments(query);

        let docs = await SolutionServiceModel.find(query).sort({sort_order: 1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile').populate('solutionId','_id name');
              
        return res.status(200).send({   
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs,countData:count });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};



const removeServices = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await SolutionServiceModel.remove({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
             result: "Service deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
////////////////////


const createOverview = async (req, res, next) => {
    let service = await FILE_UPLOAD.uploadMultipleFile(req);
   service.active = true;
    
    try {
      
        const schema = Joi.object({
            solutionServiceId: Joi.string().required(), 
            name: Joi.string().required(),
            description: Joi.string(),
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
        service = new SolutionOverviewModel(service);
        service = await service.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: service
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const updateOverview = async (req, res, next) => {
   
    try {
        if (!req.params.id) return res.status(400).json({error: "overview id is required"});
        let service = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            solutionServiceId: Joi.string().required(), 
            name: Joi.string().required(),
            description: Joi.string(),
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
        if (files.length >0) {      
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    service.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }

           });           
        }
         delete service.files;
        
        if(service.file && service.file.length < 1) delete service.file;
        if(service.blog && service.blog.length < 1) delete service.blog;

        service = await SolutionOverviewModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!service) return res.status(400).json({error: "service overview update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "service overview updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const getOverview = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        
        if (query.name) query.name = new RegExp(query.name, "i");
      
        delete query.pagination;
        delete query.limit;
        let count = await SolutionOverviewModel.countDocuments(query);
        
        let docs = await SolutionOverviewModel.find(query).sort({sort_order: 1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile').populate('solutionServiceId','_id name');
              
        return res.status(200).send({   
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs,countData:count });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};



const removeOverview = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await SolutionOverviewModel.remove({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
             result: "Service overview successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

////////////////

const pageDetail = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;
        let record = {};
        query.active = true;

        let solutions = await SolutionModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder:1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');

        let solutionService = await SolutionServiceModel.find({active:true},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).populate('file', 'name original path thumbnail smallFile').populate('children',{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0});

        record.solutionList = UTILS.cloneObject(solutions).filter(e => e._id).map(doc => {
            doc.servicesDetail = (solutionService || []).filter(e => e.solutionId && doc._id && e.solutionId.toString() == doc._id.toString()) || [];
            return doc;
           });     
       
        record.blogList = await BlogModel.find({active:true,type:'BLOGS'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt:-1}).limit(3)
        .populate('file', 'name original path thumbnail smallFile')
        .populate('thumbnail', 'name original path thumbnail smallFile')
        .populate('category', '_id name')
        ;
       
        record.meta = await MetaModel.find({link:'solution'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile');
   

        return res.status(200).send({
            status:CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const serviceDetail = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;
        let record = {};
        query.active = true;

        record.service = await SolutionServiceModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile').populate('thumbnail', 'name original path thumbnail smallFile');

        record.sideMenu = await SolutionServiceModel.find({solutionId:record.service[0].solutionId,active:1},{_id:1,name:1,slug:1});

        if(record.service[0]._id){

            record.overviewList = await SolutionOverviewModel.find({solutionServiceId:record.service[0]._id},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sort_order: 1}).populate('file', 'name original path thumbnail smallFile').populate('solutionServiceId','_id name');

            record.caseStudyList = await StoryModel.find({active:true,solutionServiceId:record.service[0]._id},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt: -1}).limit(3)
            .populate('file', 'name original path thumbnail smallFile')
            .populate('thumbnail', 'name original path thumbnail smallFile')
            .populate('tag', '_id name')
            .populate('solutionId','_id name')
            .populate('solutionServiceId','_id name')
            ;
        }
 
        record.meta = await MetaModel.find({link:'solution'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile');
   
        // case study

        return res.status(200).send({
            status:CONSTANT.REQUESTED_CODES.SUCCESS,
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

        let solutions = await SolutionModel.find(query,{_id:1,name:1,slug:1}).sort({sortOrder:1});

        let solutionService = await SolutionServiceModel.find({active:true},{solutionId:1,_id:1,name:1,slug:1}).sort({sortOrder: 1});

        record = UTILS.cloneObject(solutions).filter(e => e._id).map(doc => {
            doc.servicesDetail = (solutionService || []).filter(e => e.solutionId && doc._id && e.solutionId.toString() == doc._id.toString()) || [];
            return doc;
           });     
       
        return res.status(200).send({
            status:CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


////////

const slugSolutionList = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;
        let record = {};
        query.active = true;

        record = await SolutionModel.find(query,{slug:1}).sort({sortOrder:1}).limit(limit).skip(pagination*limit);

        return res.status(200).send({
            status:CONSTANT.REQUESTED_CODES.SUCCESS,
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
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;
        let record = {};
        query.active = true;

        record = await SolutionServiceModel.find({active:true},{slug:1}).sort({sortOrder: 1}).limit(limit).skip(pagination*limit);
 
        return res.status(200).send({
            status:CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


/////////////////////////


const createHomeModule = async (req, res, next) => {
    let service = await FILE_UPLOAD.uploadMultipleFile(req);
   service.active = true;
    
    try {
      console.log(service);
        const schema = Joi.object({
            name: Joi.string().required(), 
            shortDescription: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''), 
            files: Joi.array(),         
            active: Joi.boolean(),
            customFields: Joi.object(),
            createdBy :Joi.string(),
            
        });
       
        const { error } = schema.validate(service);
        if (error) return res.status(400).json({ error });

        service.createdBy = req.user._id;
        service.updatedBy = req.user._id;

        service = new SolutionHomeModel(service);
    
        service = await service.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: service
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const updateHomeModule = async (req, res, next) => {
   
    try {
        if (!req.params.id) return res.status(400).json({error: "id is required"});
        let service = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            name: Joi.string().required(), 
            shortDescription: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''), 
            files: Joi.array(),         
            active: Joi.boolean(),
            customFields: Joi.object(),
            createdBy :Joi.string(),
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

     
        service.updatedBy = req.user._id;
 

        service = await SolutionHomeModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!service) return res.status(400).json({error: "service module update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "service module updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const getHomeModule = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        
        if (query.name) query.name = new RegExp(query.name, "i");
      
        delete query.pagination;
        delete query.limit;
        
        let docs = await SolutionHomeModel.find(query).sort({sortOrder: 1}).limit(limit).skip(pagination*limit);

        return res.status(200).send({   
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs,countData:count });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};




const getmoduleList = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        
        if (query.name) query.name = new RegExp(query.name, "i");
      
        delete query.pagination;
        delete query.limit;
        query.active = true;
        
        let allsolution = await SolutionHomeModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1});

        let solutionService = await SolutionHomeListModel.find({active:true},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).populate('thumbnail', 'name original path thumbnail smallFile');

      
       let  solutionList = UTILS.cloneObject(allsolution).filter(e => e._id).map(doc => {
            doc.servicesDetail = (solutionService || []).filter(e => e.solutionId && doc._id && e.solutionId.toString() == doc._id.toString()) || [];
            return doc;
           });
            
              
        return res.status(200).send({   
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: solutionList });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const removeHomeModule = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await SolutionHomeModel.remove({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
             result: "Service overview successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

////////////////////////////


// home moudle inner 


const createhomeModuleInner = async (req, res, next) => {
    let service = await FILE_UPLOAD.uploadMultipleFile(req);
   service.active = true;
    
    try {
      
        const schema = Joi.object({
            solutionId: Joi.string().required(), 
            name: Joi.string().required(),
            shortDescription:Joi.string().empty(''),
            description: Joi.string().empty(''),
            innerDescription: Joi.string().empty(''),
            ctaDescription: Joi.string().empty(''),
            isHidden:Joi.boolean().empty(''),
            sortOrder: Joi.number().empty(''),
            children:Joi.array(),
            files: Joi.array(),
            slug:Joi.string().empty(''),
            imagePosition:Joi.string().empty(''),
            imageWidth:Joi.string().empty(''),
            overViewTitle:Joi.string().empty(''),
            overViewDescription: Joi.string().empty(''),
            caseTitle:Joi.string().empty(''),
            caseDescription:Joi.string().empty(''),
            imageOneThird:Joi.boolean().empty(''),
      

         
            active: Joi.boolean(),
            customFields: Joi.object(),
            createdBy :Joi.string(),
            
        });
       
        const { error } = schema.validate(service);
        if (error) return res.status(400).json({ error });
      
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

     
        service = new SolutionHomeListModel(service);
        service = await service.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: service
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const updatehomeModuleInner = async (req, res, next) => {
   
    try {
        if (!req.params.id) return res.status(400).json({error: "service id is required"});
        let service = await FILE_UPLOAD.uploadMultipleFile(req);

        const schema = Joi.object({
            solutionId: Joi.string().required(), 
            name: Joi.string().required(),
            shortDescription:Joi.string().empty(''),
            isHidden:Joi.boolean().empty(''),
            description: Joi.string().empty(''),
            imagePosition:Joi.string().empty(''),
            imageWidth:Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            children:Joi.array(),
            files: Joi.array(),
            slug:Joi.string().empty(''),
            imageOneThird:Joi.boolean().empty(''),
      
            active: Joi.boolean(),
            customFields: Joi.object(),
            createdBy :Joi.string(),
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        service.updatedBy = req.user._id;
 
        let files = service.files;
        if (files.length) {      
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
       
        if(!service.children) service.children = [];


        service = await SolutionHomeListModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!service) return res.status(400).json({error: "service module inner update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "service module inner updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const gethomeModuleInner = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
      
        if (query.name) query.name = new RegExp(query.name, "i");
      
        delete query.pagination;
        delete query.limit;
       

        let docs = await SolutionHomeListModel.find(query).sort({sortOrder: 1}).limit(limit).skip(pagination*limit).populate('thumbnail', 'name original path thumbnail smallFile').populate('solutionId','_id name');
              
        return res.status(200).send({   
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};



const removehomeModuleInner = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await SolutionHomeListModel.remove({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
             result: "Service inner module deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};



/////////////
module.exports = {
    create,
    get,
    update,
    remove,
    createServices,
    getServices,
    updateServices,
    removeServices,
    createOverview,
    getOverview,
    updateOverview,
    removeOverview,
    pageDetail,
    serviceDetail,
    menuList,
    slugSolutionList,
    slugOfferList,
    createHomeModule,
    getHomeModule,
    updateHomeModule,
    removeHomeModule,
    getmoduleList,
    createhomeModuleInner,
    gethomeModuleInner,
    updatehomeModuleInner,
    removehomeModuleInner,
};