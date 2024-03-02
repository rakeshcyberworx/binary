'use strict';

const modelName                     = 'Faq';
const Joi                           = require('@hapi/joi');
const { FaqModel,CenterModel,SettingModel,MetaModel,FaqCategoryModel }                  = require('@database');
const CONSTANT                      = require('@lib/constant');
const UTILS                         = require('@lib/utils');
const { del } = require('request');

const create = async (req, res, next) => {
    let faq = req.body || {};
    faq.active = true;
    try {
        const schema = Joi.object({
            category: Joi.string().empty(''),
            title: Joi.string().required(),
            type:Joi.string(),
            sort_order: Joi.number(),
            description: Joi.string(),
            active: Joi.boolean()
        });

        const { error } = schema.validate(faq);
        if (error) return res.status(400).json({ error });

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

const get = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
       
        let query = req.query;
        delete query.limit;
        delete query.pagination;
   
        let docs = await FaqModel.find(query).sort({type:1}).populate('category','_id name').limit(limit).skip(pagination*limit);

         return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const pageDetail = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let record = {};

         record.faqCategory = await FaqCategoryModel.aggregate([
               
            { $lookup: {
                  from: "faqs",
                  localField: "_id",
                  foreignField: "category",
                  as: "faqDetails"
            }},
          { $skip: (pagination*limit) },
          { $sort : { sort_order: 1} },
          { $limit: limit },
         
         ])
                
       
       
         record.meta = await MetaModel.find({active:true,link:'faq'}).populate('file', 'name original path thumbnail smallFile');
                
      
         return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "Faq id is required" });

        const schema = Joi.object({
            category: Joi.string().empty(''),
            title: Joi.string().required(),
            type:Joi.string(),
            sort_order: Joi.number(),
            description: Joi.string(),
            active: Joi.boolean()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        req.body.updatedBy = req.user._id;
        let faq = await FaqModel.updateOne({ _id: req.params.id }, { $set: req.body });
        if (!faq) return res.status(400).json({ error: "Faq update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Faq updated succesfully"
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

        await FaqModel.remove({ _id: req.params.id });
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Faq deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
////////////////////

const createCategory = async (req, res, next) => {
    let faq = req.body || {};
    faq.active = true;
    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            sort_order:Joi.number(),
            active: Joi.boolean()
        });

        const { error } = schema.validate(faq);
        if (error) return res.status(400).json({ error });

        faq.createdBy = req.user._id;
        faq.updatedBy = req.user._id;
        faq = new FaqCategoryModel(faq);
        faq = await faq.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: faq
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const getCategory = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = { };
        query = req.query;              

        let record = await FaqCategoryModel.find(query);
          
      
         return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
             result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const updateCategory = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "Faq id is required" });

        const schema = Joi.object({
            name: Joi.string().required(),
            sort_order:Joi.number(),
            active: Joi.boolean()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        req.body.updatedBy = req.user._id;
        let faq = await FaqCategoryModel.updateOne({ _id: req.params.id }, { $set: req.body });
        if (!faq) return res.status(400).json({ error: "Faq update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Faq updated succesfully"
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

        await FaqCategoryModel.remove({ _id: req.params.id });
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Faq deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


//////////////////////
module.exports = {
    create,
    get,
    update,
    remove,
    createCategory,
    getCategory,
    updateCategory,
    removeCategory,
    pageDetail
};