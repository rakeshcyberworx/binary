'use strict';

const modelName                 = 'Category';
const Joi                       = require('@hapi/joi');
const { CategoryModel }         = require('@database');
const CONSTANT                  = require('@lib/constant');
const UTILS                     = require('@lib/utils');
const FILE_UPLOAD               = require('@lib/file_upload');
const  sfu                      = require('slug');

const create = async (req, res, next) => {
    let category = await FILE_UPLOAD.uploadMultipleFile(req);
    category.active = true;

    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            slug: Joi.string(),
            featureCollection: Joi.number(),
            filter: Joi.number().empty(''),
            active: Joi.boolean(),
            files: Joi.array(),
            description:Joi.string(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(category);
        if (error) return res.status(400).json({ error });

        if (category.files.length) category.file = category.files.map(file => file._id);
        else delete category.files;

        category.slug = req.body.slug?sfu(req.body.slug):sfu(req.body.name);

        category.createdBy = req.user._id;
        category.updatedBy = req.user._id;

        category = new CategoryModel(category);
        category = await category.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: category
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

        let docs = await CategoryModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "Category id is required"});
        let category = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            name: Joi.string().required(),
            slug: Joi.string(),
            active: Joi.boolean(),
            filter: Joi.number(),
            featureCollection: Joi.number(),
            files: Joi.array(),
            description:Joi.string(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        if (category.files.length) category.file = category.files.map(file => file._id);
        else delete category.files;
        req.body.updatedBy = req.user._id;
        category.slug = req.body.slug?sfu(req.body.slug):sfu(req.body.name);

        category = await CategoryModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!category) return res.status(400).json({error: "Category update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Category updated succesfully"
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

        await CategoryModel.deleteOne({_id: req.params.id});
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Category deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

module.exports = {
    create,
    get,
    update,
    remove
};