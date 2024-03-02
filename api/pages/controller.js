'use strict';

const modelName                     = 'pages';
const Joi                           = require('@hapi/joi');
const { PageModel,SettingModel   }       = require('@database');
const CONSTANT                      = require('@lib/constant');
const UTILS                         = require('@lib/utils');
const FILE_UPLOAD               = require('@lib/file_upload');
const ObjectId                  = require('mongodb').ObjectId;

const create = async (req, res, next) => {
    let page = await FILE_UPLOAD.uploadMultipleFile(req);

    try {
        const schema = Joi.object({
            title: Joi.string().required(),
            sort_des: Joi.string().empty(''),
            description: Joi.string().empty(''),
            meta_title: Joi.string().empty(''),
            meta_description: Joi.string().empty(''),
            meta_keyword: Joi.string().empty(''),
            sort_order: Joi.number().empty(''),
            keyword: Joi.string().required(),
            status: Joi.number().empty(''),
            files: Joi.array()
        });

        const { error } = schema.validate(page);
        if (error) return res.status(400).json({ error });
        
        page = new PageModel(page);
        page = await page.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: page
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
        if (req.query._id) where._id = req.query._id;
     
        let docs = await PageModel.find(where).sort({createdAt: -1});
       
        return res.status(200).send({ result: docs});
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "Payment id is required" });
        let page = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            title: Joi.string().required(),
            sort_des: Joi.string().empty(''),
            description: Joi.string().empty(''),
            meta_title: Joi.string().empty(''),
            meta_description: Joi.string().empty(''),
            meta_keyword: Joi.string().empty(''),
            sort_order: Joi.number().empty(''),
            keyword: Joi.string().required(),
            status: Joi.number().empty(''),
            files: Joi.array()
        });
            
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

      
       // req.body.updatedBy = req.user._id;
     
        let result = await PageModel.updateOne({ _id: req.params.id }, {$set: req.body});
       
        if (!result) return res.status(400).json({ error: "Pages update failed" });
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Pages updated succesfully"
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

        await PageModel.remove({ _id: req.params.id });
        return res.status(200).send({ result: "pages deleted successfully" });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const getPageDetail = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let where = {};
        if (req.query.page) where.keyword = req.query.page;
        let record = { };
        record.heading = await PageModel.find(where).sort({createdAt: -1});
        record.setting = await SettingModel.find().sort({ createdAt: -1 })
        .populate('logo', 'name original path thumbnail smallFile')
        .populate('footer_logo', 'name original path thumbnail smallFile')
        .populate('favicon', 'name original path thumbnail smallFile')
        .populate('default_logo', 'name original path thumbnail smallFile');
       
        return res.status(200).send({ result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};





module.exports = {
    create,
    get,
    remove,
    update,
    getPageDetail

};