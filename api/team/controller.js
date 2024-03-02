'use strict';

const modelName                 = 'Team';
const Joi                       = require('@hapi/joi');
const { TeamModel }             = require('@database');
const CONSTANT                  = require('@lib/constant');
const UTILS                     = require('@lib/utils');
const FILE_UPLOAD               = require('@lib/file_upload');


const create = async (req, res, next) => {
    let team = await FILE_UPLOAD.uploadMultipleFile(req);
    team.active=true;
    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            designation: Joi.string().empty(''),
            description: Joi.string().empty(''),
            fulldescription: Joi.string().empty(''),
            link: Joi.string().empty(''),
            active: Joi.boolean().empty(''),
            sort_order: Joi.number().empty(''),
            type:Joi.string(),
            linkedin:Joi.string().empty(''),
            files: Joi.array(),
            type:Joi.string().empty(''),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(team);
        if (error) return res.status(400).json({ error });

       let files = team.files;
        if (files.length) {
                
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    team.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }
                if(iteam.fieldName== 'blog'){
                    team.banner = files.filter(e => e.fieldName == 'blog').map(file => file._id); 
                }
               
           });
        } else delete team.files;



        team.createdBy = req.user._id;
        team.updatedBy = req.user._id;

        team = new TeamModel(team);
        team = await team.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: team
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
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;

        let docs = await TeamModel.find(query).sort({sort_order: 1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "team id is required"});
        let team = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            name: Joi.string().required(),
            designation: Joi.string().empty(''),
            description: Joi.string().empty(''),
            fulldescription: Joi.string().empty(''),
            link: Joi.string().empty(''),
            linkedin:Joi.string().empty(''),
            active: Joi.boolean().empty(''),
            type:Joi.string(),
            sort_order: Joi.number().empty(''),
            files: Joi.array(),
            type:Joi.string().empty(''),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        let files = team.files;
        if (files.length) {  

            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    team.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }
                if(iteam.fieldName== 'blog'){
                    team.banner = files.filter(e => e.fieldName == 'blog').map(file => file._id); 
                }
               
           });
               
        }
         delete team.files;
        
        if(team.file && team.file.length < 1) delete team.file;
        if(team.blog && team.blog.length < 1) delete team.blog;

        req.body.updatedBy = req.user._id;

        team = await TeamModel.updateOne({_id: req.params.id}, {$set: req.body});
       
        if (!team) return res.status(400).json({error: "team update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "team updated succesfully"
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

        await TeamModel.deleteOne({_id: req.params.id});
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Team Deleted succesfully" 
        });
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