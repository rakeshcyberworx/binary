'use strict';

const modelName                 = 'Vision';
const Joi                       = require('@hapi/joi');
const { VisionModel,GalleryHeadingModel }           = require('@database');
const CONSTANT                  = require('@lib/constant');
const UTILS                     = require('@lib/utils');
const FILE_UPLOAD               = require('@lib/file_upload');


const create = async (req, res, next) => {
    let vision = await FILE_UPLOAD.uploadMultipleFile(req);
    vision.active = true;
    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            files: Joi.array(),
            description:Joi.string(),
            active:Joi.boolean(),
            sort_order:Joi.number(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(vision);
        if (error) return res.status(400).json({ error });

        if (vision.files.length) vision.file = vision.files.map(file => file._id);
        else delete vision.files;

        vision.createdBy = req.user._id;
        vision.updatedBy = req.user._id;

        vision = new VisionModel(vision);
        vision = await vision.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: vision
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

        let docs = await VisionModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "vision id is required"});
        let vision = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            name: Joi.string().required(),
            files: Joi.array(),
            description:Joi.string(),
            active:Joi.boolean(),
            sort_order:Joi.number(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        if (vision.files.length) vision.file = vision.files.map(file => file._id);
        else delete vision.files;
        req.body.updatedBy = req.user._id;

        vision = await VisionModel.updateOne({_id: req.params.id}, {$set: req.body});
        if (!vision) return res.status(400).json({error: "vision update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "vision updated succesfully"
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

        await VisionModel.deleteOne({_id: req.params.id});
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "vision Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


////////////////////////////////


const createGalleryHeading = async (req, res, next) => {
    let heading = await FILE_UPLOAD.uploadMultipleFile(req);

    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            description: Joi.string().empty(''),
            vtitle: Joi.string().empty(''),
            vdescription: Joi.string().empty(''),
            ltitle: Joi.string().empty(''),
            ldescription: Joi.string().empty(''),
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

        heading = new GalleryHeadingModel(heading);
        heading = await heading.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: heading
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getGalleryHeading = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;

        let docs = await GalleryHeadingModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateGalleryHeading = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "Address id is required"});
        let team = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            name: Joi.string().required(),
            description: Joi.string().empty(''),
            vtitle: Joi.string().empty(''),
            vdescription: Joi.string().empty(''),
            ltitle: Joi.string().empty(''),
            ldescription: Joi.string().empty(''),
            status: Joi.number().empty(''),
            files: Joi.array(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        if (team.files.length) team.file = team.files.map(file => file._id);
        else delete team.files;
        req.body.updatedBy = req.user._id;

        team = await GalleryHeadingModel.updateOne({_id: req.params.id}, {$set: req.body});
       
        if (!team) return res.status(400).json({error: "Gallery update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Gallery updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeGalleryHeading = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await GalleryHeadingModel.deleteOne({_id: req.params.id});
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Gallery Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


///////////////////////


module.exports = {
    create,
    get,
    update,
    remove,
    getGalleryHeading,
    createGalleryHeading,
    updateGalleryHeading,
    removeGalleryHeading
};