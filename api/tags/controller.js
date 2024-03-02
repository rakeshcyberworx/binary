'use strict';

const modelName                 = 'Tags';
const Joi                       = require('@hapi/joi');
const { TagsModel }             = require('@database');
const CONSTANT                  = require('@lib/constant');
const UTILS                     = require('@lib/utils');

const create = async (req, res, next) => {
    let tags = req.body || {};
    tags.active = true;

    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            code: Joi.string().required(),
            active: Joi.boolean().required(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(tags);
        if (error) return res.status(400).json({ error });

        tags.createdBy = req.user._id;
        tags.updatedBy = req.user._id;
        tags = new TagsModel(tags);
        tags = await tags.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: tags
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
        delete query.pagination;
        delete query.limit;

        let docs = await TagsModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit);
        return res.status(200).send({ result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({error: "Tags id is required"});

        const schema = Joi.object({
            name: Joi.string(),
            code: Joi.string(),
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        req.body.updatedBy = req.user._id;
        let tags = await TagsModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!tags) return res.status(400).json({error: "Tags update failed"});

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Tags updated succesfully"
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

        await TagsModel.remove({_id: req.params.id});
        return res.status(200).send({ result: "Tags deleted successfully" });
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