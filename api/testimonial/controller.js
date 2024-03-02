'use strict';

const modelName                 = 'Testimonial';
const Joi                       = require('@hapi/joi');
const { TestimonialModel,MetaModel,PartnerModel }      = require('@database');
const CONSTANT                  = require('@lib/constant');
const UTILS                     = require('@lib/utils');
const FILE_UPLOAD               = require('@lib/file_upload');


const create = async (req, res, next) => {
    let testimonial = await FILE_UPLOAD.uploadMultipleFile(req);
    testimonial.active = true;
    try {
        const schema = Joi.object({
            name: Joi.string().empty(''),
            youtube: Joi.string().empty(''),
            page: Joi.string().empty(''),
            designation: Joi.string().empty(''),
            active: Joi.boolean().empty(''),
            feature: Joi.number().empty(''),
            type:Joi.string(),
            sortOrder: Joi.number().empty(''),
            files: Joi.array(),
            description:Joi.string().empty(''),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(testimonial);
        if (error) return res.status(400).json({ error });

        let files = testimonial.files;
        if (files.length) {
            testimonial.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete testimonial.files;
  
        testimonial.createdBy = req.user._id;
        testimonial.updatedBy = req.user._id;

        testimonial = new TestimonialModel(testimonial);
        testimonial = await testimonial.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: testimonial
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}





const testimonial = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        if(query.youtube) query.youtube = {$exists:true} ;
        delete query.pagination;
        delete query.limit;
        let record = {};
        query.active = true;
        query.type = 'EXPERIENCE';
        query.feature = 1;

        record.featureTestimonial = await TestimonialModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
        query['feature'] = {$ne:1};

        record.TestimonialList = await TestimonialModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
        delete query.feature;
        record.partnerList    = await PartnerModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({createdAt: -1})
        .populate('file', 'name original path thumbnail smallFile')
        .populate('tag',"_id name")
        ;


        record.meta = await MetaModel.findOne({active:true,link:'customer-experience'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile').populate('blog', 'name original path thumbnail smallFile');   
      
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record });
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
        if(query.youtube) query.youtube = {$exists:true} ;
        delete query.pagination;
        delete query.limit;

        let docs = await TestimonialModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });


    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "Testimonial id is required"});
        let testimonial = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            name: Joi.string().empty(''),
            youtube: Joi.string().empty(''),
            page: Joi.string().empty(''),
            designation: Joi.string().empty(''),
            feature: Joi.number().empty(''),
            active: Joi.boolean().empty(''),
            type:Joi.string(),
            sortOrder: Joi.number().empty(''),
            files: Joi.array(),
            description:Joi.string().empty(''),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        if (testimonial.files.length) testimonial.file = testimonial.files.map(file => file._id);
        else delete testimonial.files;
        req.body.updatedBy = req.user._id;

        testimonial = await TestimonialModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!testimonial) return res.status(400).json({error: "Testimonial update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Testimonial updated succesfully"
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

        await TestimonialModel.deleteOne({_id: req.params.id});
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Testimonial Deleted succesfully" 
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
    testimonial
};