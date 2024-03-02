'use strict';

const modelName                     = 'CareerModel';
const Joi                           = require('@hapi/joi');
const { 
    CareerModel,
    GalleryModel,
    CareerBenafitModel,
    EmployeeSpeakModel,
    TestimonialModel,
    MetaModel,
    SettingModel,
    CenterModel,
    CareerJobApplyModel,
    CareerHeadingModel
 }                 = require('@database');
const CONSTANT                      = require('@lib/constant');
const UTILS                         = require('@lib/utils');
const FILE_UPLOAD                   = require('@lib/file_upload');
const ejs                           = require('ejs');
const fs                            = require('fs');
const path                          = require('path');
const mail                          = require('@lib/mailer');

const create = async (req, res, next) => {
    let career = await FILE_UPLOAD.uploadMultipleFile(req);
    
    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            department: Joi.string().empty(''),
            files: Joi.array(),
            location: Joi.string().empty(''),
            experience: Joi.string().empty(''),
            compensation: Joi.string().empty(''),
            jobType:Joi.string().empty(''),
            posted: Joi.string().empty(''),
            vacancy: Joi.string().empty(''),
            description: Joi.string().empty(''),
            active: Joi.boolean(),
            sort_order: Joi.number().empty(''),
            customFields: Joi.object()
        });

        const { error } = schema.validate(career);
        if (error) return res.status(400).json({ error });

        let files = career.files;
        if (files.length) {
            career.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete career.files;

        career.createdBy = req.user._id;
        career.updatedBy = req.user._id;
        
        career = new CareerModel(career);
        career = await career.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: career
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}



const pageDetail = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : '');
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        let record = {};
        record.heading = await CareerHeadingModel.find({active:true},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile');

        record.jobsList = await CareerModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sort_order: 1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile');

        record.gallery = await GalleryModel.find({active:true},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile');

        record.benafitsList = await CareerBenafitModel.find({active:true},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile');

        record.TestimonialList = await TestimonialModel.find({active:true,type:'CAREER'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).populate('file', 'name original path thumbnail smallFile');
      

        record.meta = await MetaModel.find({active:true,link:'career'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile');
      

        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const get = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : '');
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
   

        let docs = await CareerModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile');


        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};



const update = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "blog id is required" });
        let career = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            name: Joi.string().required(),
            department: Joi.string().empty(''),
            files: Joi.array(),
            location: Joi.string().empty(''),
            jobType:Joi.string().empty(''),
            experience: Joi.string().empty(''),
            compensation: Joi.string().empty(''),
            posted: Joi.string().empty(''),
            vacancy: Joi.string().empty(''),
            description: Joi.string().empty(''),
            active: Joi.boolean(),
            sort_order: Joi.number().empty(''),
            customFields: Joi.object()
        });

        const { error } = schema.validate(career);
        if (error) return res.status(400).json({ error });

        let files = career.files;
        if (files.length) {
            career.files = file.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete career.files;

        if(career.files && career.files.length < 1) delete career.files;
        career.updatedBy = req.user._id;
       
        let careerData = await CareerModel.updateOne({ _id: req.params.id }, {$set: career} );
        if (!careerData) return res.status(400).json({ error: "career update failed" });
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "career updated succesfully"
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

        await CareerModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "blog Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};



const jobApply = async (req, res, next) => {
    let career = await FILE_UPLOAD.uploadMultipleFile(req);
    
    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().empty(''),
            files: Joi.array(),
            phone: Joi.string().empty(''),
            appliedFor: Joi.string().empty(''),
            type: Joi.string().empty(''),
            jobs: Joi.string().empty(''),
            currentRole: Joi.string().empty(''),
            currentCompany: Joi.string().empty(''),
            message: Joi.string().empty(''),
            customFields: Joi.object()
        });

        const { error } = schema.validate(career);
        if (error) return res.status(400).json({ error });

     
        if (career.files.length) career.file = career.files.map(file => file._id);
        else delete career.files;
        
        career = new CareerJobApplyModel(career);
        career = await career.save();


        if(career.name){
            let enq = await CareerJobApplyModel.find({_id:career._id}).populate('file', 'name original path thumbnail smallFile').populate('jobs','_id name').populate('state','_id name');
          
            let compiled = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../../docs/email_templates/careerenquiry.ejs'), 'utf8')),
               
                dataToCompile = {
                    name:enq[0].name,
                    email:enq[0].email,
                    phone:enq[0].phone,
                    ...(enq[0].jobs && {jobs:enq[0].jobs.name}),
                    ...(career.appliedFor && {appliedFor:enq[0].appliedFor}),
                    ...(career.file && {file:enq[0].file.path}),
                    currentRole:enq[0].currentRole,
                    currentCompany:enq[0].currentCompany,
                    message:enq[0].message,

                                   
                };                                                        
        
        await mail.sendMail([process.env.CAREER_MAIL], `You have new Career Enquiry `, compiled(dataToCompile));
        }




        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: career
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}




const GetjobApply = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : '');
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;

        if(query.name) query.name = new RegExp(query.name,"i");


        delete query.pagination;
        delete query.limit;


        let docs = await CareerJobApplyModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile').populate('jobs','_id name').populate('state','_id name');
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


////////////////

const createGallery = async (req, res, next) => {
    let career = await FILE_UPLOAD.uploadMultipleFile(req);
    career.active = true;
    career.type = 'CAREER';
    try {
        const schema = Joi.object({
            name: Joi.string().empty(''),  
            files: Joi.array(),
            description: Joi.string().empty(''),
            type: Joi.string(),
            active: Joi.boolean().empty(''),
            sort_order: Joi.number().empty(''),
            customFields: Joi.object()
        });

        const { error } = schema.validate(career);
        if (error) return res.status(400).json({ error });

        let files = career.files;
        if (files.length) {
            career.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete career.files;

        career.createdBy = req.user._id;
        career.updatedBy = req.user._id;
        
        career = new GalleryModel(career);
        career = await career.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: career
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}



const getGallery = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        let docs = await GalleryModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile');
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateGallery = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "blog id is required" });
        let career = await FILE_UPLOAD.uploadMultipleFile(req);
        career.type = 'CAREER';
        const schema = Joi.object({
            name: Joi.string().empty(''),  
            files: Joi.array(),
            type: Joi.string(),
            description: Joi.string().empty(''),
            active: Joi.boolean().empty(''),
            sort_order: Joi.number().empty(''),
            customFields: Joi.object()
        });

        const { error } = schema.validate(career);
        if (error) return res.status(400).json({ error });

           if (career.files.length) career.file = career.files.map(file => file._id);
        else delete career.files;

        if(career.files && career.files.length < 1) delete career.files;
        career.updatedBy = req.user._id;
       
        let careerData = await GalleryModel.updateOne({ _id: req.params.id }, {$set: career} );
        if (!careerData) return res.status(400).json({ error: "gallery update failed" });
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "gallery updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeGallery = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await GalleryModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "gallery Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};



const createBenafits = async (req, res, next) => {
    let career = await FILE_UPLOAD.uploadMultipleFile(req);
    career.active=true;
    try {
        const schema = Joi.object({
            name: Joi.string().required(),  
            active: Joi.boolean().empty(''),
            files: Joi.array(),
            description: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            customFields: Joi.object()
        });

        const { error } = schema.validate(career);
        if (error) return res.status(400).json({ error });

        let files = career.files;
        if (files.length) {
            career.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete career.files;

        career.createdBy = req.user._id;
        career.updatedBy = req.user._id;
        
        career = new CareerBenafitModel(career);
        career = await career.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: career
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}



const getBenafits = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        let docs = await CareerBenafitModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile');
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateBenafits = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "Benafits id is required" });
        let career = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            name: Joi.string().required(),  
            active: Joi.boolean().empty(''),
            files: Joi.array(),
            description: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            customFields: Joi.object()
        });

        const { error } = schema.validate(career);
        if (error) return res.status(400).json({ error });

           if (career.files.length) career.file = career.files.map(file => file._id);
        else delete career.files;

        if(career.files && career.files.length < 1) delete career.files;
        career.updatedBy = req.user._id;
       
        let careerData = await CareerBenafitModel.updateOne({ _id: req.params.id }, {$set: career} );
        if (!careerData) return res.status(400).json({ error: "Benafits update failed" });
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Benafits updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeBenafits = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await CareerBenafitModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Benafits Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

//////////////////////////


const createHeading = async (req, res, next) => {
    let career = await FILE_UPLOAD.uploadMultipleFile(req);
    career.active = true;
    try {
        const schema = Joi.object({
            title: Joi.string().required(),  
            files: Joi.array(),
            description: Joi.string().empty(''),
            benafitTitle: Joi.string().empty(''),
            benafitDescription: Joi.string().empty(''),
            positionTitle: Joi.string().empty(''),
            positionDescription: Joi.string().empty(''),
            cultureTitle: Joi.string().empty(''),
            cultureDescription: Joi.string().empty(''),
            speakTitle: Joi.string().empty(''),
            speakDescription: Joi.string().empty(''),
            joinTitle: Joi.string().empty(''),
            joinDescription: Joi.string().empty(''),
            doNext: Joi.array().empty(''),
            email: Joi.string().empty(''),
            teamTitle: Joi.string().empty(''),
            teamDescription: Joi.string().empty(''),
            termLine: Joi.string().empty(''),
            termDescription: Joi.string().empty(''),
           active: Joi.boolean().empty(''),
            sort_order: Joi.number().empty(''),
            customFields: Joi.object()
        });

        const { error } = schema.validate(career);
        if (error) return res.status(400).json({ error });

        let files = career.files;
        if (files.length) {
            career.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete career.files;

        career.createdBy = req.user._id;
        career.updatedBy = req.user._id;
        
        career = new CareerHeadingModel(career);
        career = await career.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: career
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
        let docs = await CareerHeadingModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile');
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};





const updateHeading = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "Benafits id is required" });
        let career = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            title: Joi.string().required(),  
            files: Joi.array(),
            description: Joi.string().empty(''),
            benafitTitle: Joi.string().empty(''),
            benafitDescription: Joi.string().empty(''),
            positionTitle: Joi.string().empty(''),
            positionDescription: Joi.string().empty(''),
            cultureTitle: Joi.string().empty(''),
            cultureDescription: Joi.string().empty(''),
            speakTitle: Joi.string().empty(''),
            speakDescription: Joi.string().empty(''),
            joinTitle: Joi.string().empty(''),
            joinDescription: Joi.string().empty(''),
            doNext: Joi.array(),
            email: Joi.string().empty(''),
            teamTitle: Joi.string().empty(''),
            teamDescription: Joi.string().empty(''),
            termLine: Joi.string().empty(''),
            termDescription: Joi.string().empty(''),
           active: Joi.boolean().empty(''),
            sort_order: Joi.number().empty(''),
            customFields: Joi.object()
        });

        const { error } = schema.validate(career);
        if (error) return res.status(400).json({ error });

           if (career.files.length) career.file = career.files.map(file => file._id);
        else delete career.files;

        if(career.files && career.files.length < 1) delete career.files;
        career.updatedBy = req.user._id;
       
        let careerData = await CareerHeadingModel.updateOne({ _id: req.params.id }, {$set: career} );
        if (!careerData) return res.status(400).json({ error: "Benafits update failed" });
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Benafits updated succesfully"
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

        await CareerHeadingModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Benafits Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
/////////////////////////////




module.exports = {
    create,
    get,
    update,
    remove,
    createGallery,
    getGallery,
    updateGallery,
    removeGallery,
    createBenafits,
    getBenafits,
    updateBenafits,
    removeBenafits,   
    createHeading,
    getHeading,
    updateHeading,
    removeHeading,
    jobApply,
    GetjobApply,
    pageDetail
};