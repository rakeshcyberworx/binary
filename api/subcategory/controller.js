'use strict';

const modelName                 = 'Subcategory';
const Joi                       = require('@hapi/joi');
const { SubcategoryModel }      = require('@database');
const CONSTANT                  = require('@lib/constant');
const UTILS                     = require('@lib/utils');
const FILE_UPLOAD               = require('@lib/file_upload');
const ObjectId                  = require('mongodb').ObjectId;

const create = async (req, res, next) => {
    let subcategory = await FILE_UPLOAD.uploadMultipleFile(req);
    subcategory.active = true;

    try {
        const schema = Joi.object({
            category: Joi.string().required(),
            name: Joi.string().required(),
            slug: Joi.string().required(),
            files: Joi.array(),
            active: Joi.boolean().required(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(subcategory);
        if (error) return res.status(400).json({ error });
        if (subcategory.files.length) subcategory.files = subcategory.files.map(file => file._id);
        else delete subcategory.files;

        subcategory.createdBy = req.user._id;
        subcategory.updatedBy = req.user._id;
        subcategory = new SubcategoryModel(subcategory);
        subcategory = await subcategory.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: subcategory
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const get = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let where = {};
        if(req.query._id) where._id = ObjectId(req.query._id);
        if(req.query.category) where.category = ObjectId(req.query.category); 

        where = req.query;  
        delete where.pagination;
        delete where.limit;

        let docs = await SubcategoryModel.find(where).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate("category",'name').populate('files', 'name original path thumbnail smallFile');
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({error: "Sub Category id is required"});
        let subcategory = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            category: Joi.string(),
            name: Joi.string(),
            files: Joi.array(),
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });
        if (subcategory.files.length) subcategory.files = subcategory.files.map(file => file._id);
        else delete subcategory.files;

        req.body.updatedBy = req.user._id;
        subcategory = await SubcategoryModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!subcategory) return res.status(400).json({error: "Sub Category update failed"});

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Sub category updated succesfully"
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

        await SubcategoryModel.deleteOne({_id: new mongoose.Types.ObjectId(req.params.id)});
        return res.status(200).send({ result: "Sub category deleted successfully" });
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