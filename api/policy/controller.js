'use strict';

const modelName                     = 'policy';
const Joi                           = require('@hapi/joi');
const { PolicyModel,
    PolicyCategoryModel,
    ContactHeadingModel,
    FaqModel,
    CenterModel,
    SettingModel,
    MetaModel,
    FaqCategoryModel }                 = require('@database');
const CONSTANT                      = require('@lib/constant');
const UTILS                         = require('@lib/utils');
const FILE_UPLOAD                   = require('@lib/file_upload');
const ObjectId                  = require('mongodb').ObjectId;

const create = async (req, res, next) => {
    let event = await FILE_UPLOAD.uploadMultipleFile(req);
       
    try {
        const schema = Joi.object({
            title: Joi.string().required(),
            category: Joi.string().required(),
            link: Joi.string().empty(''),
            files: Joi.array(),
            sort_order: Joi.number().empty(''),
            status: Joi.number().empty(''),
            customFields: Joi.object()
        });

        const { error } = schema.validate(event);
        if (error) return res.status(400).json({ error });

        let files = event.files;
        if (files.length) {
            event.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete event.files;

        event.createdBy = req.user._id;
        event.updatedBy = req.user._id;
        
        event = new PolicyModel(event);
        event = await event.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: event
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const get = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : '');
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        let docs = await PolicyModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile').populate('category','_id name')
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "Policy id is required" });
        let event = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            title: Joi.string().required(),
            category: Joi.string().required(),
            link: Joi.string().empty(''),
            files: Joi.array(),
            sort_order: Joi.number().empty(''),
            status: Joi.number().empty(''),
            customFields: Joi.object()
        });

        const { error } = schema.validate(event);
        if (error) return res.status(400).json({ error });

        let files = event.files;
        if (files.length) {
            event.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete event.files;

        if(event.files && event.files.length < 1) delete event.files;

        event.updatedBy = req.user._id;
       
        let eventData = await PolicyModel.updateOne({ _id: req.params.id }, {$set: event} );
        if (!eventData) return res.status(400).json({ error: "Policy update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Policy updated succesfully"
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

        await PolicyModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Policy Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

//////////////////////////////////


const createPolicyCategory = async (req, res, next) => {
    let award = await FILE_UPLOAD.uploadMultipleFile(req);

    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            description: Joi.string().empty(''),
            showCustomer: Joi.number().empty(''),
            status: Joi.number().empty(''),
            sort_order: Joi.number().empty(''),
            files: Joi.array(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(award);
        if (error) return res.status(400).json({ error });

        if (award.files.length) award.file = award.files.map(file => file._id);
        else delete award.files;

        award.createdBy = req.user._id;
        award.updatedBy = req.user._id;

        award = new PolicyCategoryModel(award);
        award = await award.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: award
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getPolicyCategory = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;

        let docs = await PolicyCategoryModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updatePolicyCategory = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "Download id is required"});
        let team = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({ 
            name: Joi.string().required(),
            description: Joi.string().empty(''),
            showCustomer: Joi.number().empty(''),
            status: Joi.number().empty(''),
            sort_order: Joi.number().empty(''),
            files: Joi.array(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        if (team.files.length) team.file = team.files.map(file => file._id);
        else delete team.files;
        req.body.updatedBy = req.user._id;

        team = await PolicyCategoryModel.updateOne({_id: req.params.id}, {$set: req.body});
       
        if (!team) return res.status(400).json({error: "Download update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Download updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removePolicyCategory = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await PolicyCategoryModel.deleteOne({_id: req.params.id});
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Download Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
//////////////////



const createHeading = async (req, res, next) => {
    let heading = await FILE_UPLOAD.uploadMultipleFile(req);

    try {
        const schema = Joi.object({
            heading: Joi.string().required(),
            description: Joi.string().empty(''),
            phone: Joi.string().empty(''),
            email: Joi.string().empty(''),
            address: Joi.string().empty(''),
            ntitle: Joi.string().empty(''),
            nname: Joi.string().empty(''),
            nphone: Joi.string().empty(''),
            nemail: Joi.string().empty(''),
            gtitle: Joi.string().empty(''),
            gname: Joi.string().empty(''),
            gphone: Joi.string().empty(''),
            gemail: Joi.string().empty(''),
            rtitle: Joi.string().empty(''),
            rdescription: Joi.string().empty(''),
            status: Joi.number().empty(''),
            files: Joi.array(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(heading);
        if (error) return res.status(400).json({ error });

        if (heading.files.length) heading.file = heading.files.map(file => file._id);
        else delete heading.files;

        heading.createdBy = req.user._id;
        heading.updatedBy = req.user._id;

        heading = new ContactHeadingModel(heading);
        heading = await heading.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: heading
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

        let docs = await ContactHeadingModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateHeading = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "Download id is required"});
        let team = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({ 
            heading: Joi.string().required(),
            description: Joi.string().empty(''),
            phone: Joi.string().empty(''),
            email: Joi.string().empty(''),
            address: Joi.string().empty(''),
            ntitle: Joi.string().empty(''),
            nname: Joi.string().empty(''),
            nphone: Joi.string().empty(''),
            nemail: Joi.string().empty(''),
            gtitle: Joi.string().empty(''),
            gname: Joi.string().empty(''),
            gphone: Joi.string().empty(''),
            gemail: Joi.string().empty(''),
            rtitle: Joi.string().empty(''),
            rdescription: Joi.string().empty(''),
            status: Joi.number().empty(''),
            files: Joi.array(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        if (team.files.length) team.file = team.files.map(file => file._id);
        else delete team.files;
        req.body.updatedBy = req.user._id;

        team = await ContactHeadingModel.updateOne({_id: req.params.id}, {$set: req.body});
       
        if (!team) return res.status(400).json({error: "Download update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Download updated succesfully"
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

        await ContactHeadingModel.deleteOne({_id: req.params.id});
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Download Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
//////////////////////////////


const createFaqCategory = async (req, res, next) => {
    let award = await FILE_UPLOAD.uploadMultipleFile(req);

    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            status: Joi.number().empty(''),
            sort_order: Joi.number().empty(''),
            files: Joi.array(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(award);
        if (error) return res.status(400).json({ error });

        if (award.files.length) award.file = award.files.map(file => file._id);
        else delete award.files;

        award.createdBy = req.user._id;
        award.updatedBy = req.user._id;

        award = new FaqCategoryModel(award);
        award = await award.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: award
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const  getFaqCategory = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;

        let docs = await FaqCategoryModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateFaqCategory = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "Download id is required"});
        let team = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({ 
            name: Joi.string().required(),
            status: Joi.number().empty(''),
            sort_order: Joi.number().empty(''),
            files: Joi.array(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        if (team.files.length) team.file = team.files.map(file => file._id);
        else delete team.files;
        req.body.updatedBy = req.user._id;

        team = await FaqCategoryModel.updateOne({_id: req.params.id}, {$set: req.body});
       
        if (!team) return res.status(400).json({error: "Download update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Download updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeFaqCategory = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await FaqCategoryModel.deleteOne({_id: req.params.id});
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Download Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
////////////////////////////////



const createFaqs = async (req, res, next) => {
    let faq = await FILE_UPLOAD.uploadMultipleFile(req);
       
    try {
        const schema = Joi.object({
            title: Joi.string().required(),
            category: Joi.string().required(),
            description: Joi.string().empty(''),
            files: Joi.array(),
            sort_order: Joi.number().empty(''),
            status: Joi.number().empty(''),
            customFields: Joi.object()
        });

        const { error } = schema.validate(faq);
        if (error) return res.status(400).json({ error });

        let files = faq.files;
        if (files.length) {
            faq.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete faq.files;

        faq.createdBy = req.user._id;
        faq.updatedBy = req.user._id;
        
        faq = new FaqModel(faq);
        faq = await faq.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: faq
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const getFaqs = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : '');
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        let docs = await FaqModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit)
        .populate('file', 'name original path thumbnail smallFile').populate('category','_id name')
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateFaqs = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "Policy id is required" });
        let event = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            title: Joi.string().required(),
            category: Joi.string().required(),
            description: Joi.string().empty(''),
            files: Joi.array(),
            sort_order: Joi.number().empty(''),
            status: Joi.number().empty(''),
            customFields: Joi.object()
        });

        const { error } = schema.validate(event);
        if (error) return res.status(400).json({ error });

        let files = event.files;
        if (files.length) {
            event.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete event.files;

        if(event.files && event.files.length < 1) delete event.files;

        event.updatedBy = req.user._id;
       
        let eventData = await FaqModel.updateOne({ _id: req.params.id }, {$set: event} );
        if (!eventData) return res.status(400).json({ error: "Policy update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Policy updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeFaqs = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await FaqModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Policy Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const getPolicyData = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : '');
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        let record = { };
      
        // record.policyCategory = await PolicyCategoryModel.find({status:1}).sort({sort_order: 1}).populate('file', 'name original path thumbnail smallFile').populate('policy');
        
        record.policyCategory = await PolicyCategoryModel.aggregate([
            {"$match":{"status":1}},     
            { $lookup: {
                  from: "policies",
                  localField: "_id",
                  foreignField: "category",
                  as: "policyDetails",                  
            },                    
        },
        
        //    { $file: "policyDetails" },
        //   { $skip: (pagination*limit) },
          { $sort : { sort_order: 1} },
          
        //   { $limit: limit },
         
         ]);    

        // record.policyList = await PolicyModel.find({status:1}).sort({sort_order: 1})
        // .populate('file', 'name original path thumbnail smallFile').populate('category','_id name');

      
        record.lifeinsurance = await CenterModel.find(query).sort({ createdAt: -1 })
        .populate('attributes.attributeId', 'name')
        .populate('file', 'name original path thumbnail smallFile')
        .populate('blog', 'name original path thumbnail smallFile');
        record.meta = await MetaModel.find({status:1,link:'policies'}).populate('file', 'name original path thumbnail smallFile');
        record.setting = await SettingModel.find()
        .populate('logo', 'name original path thumbnail smallFile')
        .populate('footer_logo', 'name original path thumbnail smallFile')
        .populate('favicon', 'name original path thumbnail smallFile')
        .populate('default_logo', 'name original path thumbnail smallFile');
        return res.status(200).send({ result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};



const getPolicyCategories = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;

        let docs = await PolicyCategoryModel.find({status:1}).sort({sort_order: 1}).limit(limit).skip(pagination*limit);
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};



const getPolicyList = async (req, res, next) => {
    try {
        let query = { };
        if(req.query.category) query.category = ObjectId(req.query.category);
           
        let docs = await PolicyModel.find(query).sort({sort_order: 1}).populate('file','name original path thumbnail smallFile');
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const getCustomerPolicyCategory = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;

        let docs = await PolicyCategoryModel.find({showCustomer:1}).sort({sort_order: 1}).limit(limit).skip(pagination*limit);
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

////////////////////////
module.exports = {
    create,
    get,
    update,
    remove,
    getPolicyCategory,
    createPolicyCategory,
    updatePolicyCategory,
    removePolicyCategory,  
    getHeading,
    createHeading,
    updateHeading,
    removeHeading,
    getFaqCategory,
    createFaqCategory,
    updateFaqCategory,
    removeFaqCategory,
    getFaqs,
    createFaqs,
    updateFaqs,
    removeFaqs,
    getPolicyData,
    getPolicyCategories,
    getPolicyList,
    getCustomerPolicyCategory
};