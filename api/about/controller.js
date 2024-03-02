'use strict';

const modelName                     = 'about';
const Joi                           = require('@hapi/joi');
const { AboutModel,
    TeamModel,
    PresenceModel,
    
    JourneyModel,
    ContactModel,
    CenterModel,
    CityModel,
   
    SettingModel,
    MetaModel,
    PartnerModel,
    GalleryHeadingModel,
    GalleryModel,
    BlogModel,
   
    VisionModel }                   = require('@database');
const CONSTANT                      = require('@lib/constant');
const UTILS                         = require('@lib/utils');
const FILE_UPLOAD                   = require('@lib/file_upload');
const { result } = require('@hapi/joi/lib/base');

const create = async (req, res, next) => {
    let about = await FILE_UPLOAD.uploadMultipleFile(req);
     
    try {
        const schema = Joi.object({
            title: Joi.string().required(),
            description :Joi.string().empty(''),
            files: Joi.array(),
            presenceTitle: Joi.string().empty(''),
            presenceDescription: Joi.string().empty(''),
            contactTitle: Joi.string().empty(''),
            contactDescription: Joi.string().empty(''),
            csrTitle: Joi.string().empty(''),
            csrDescription: Joi.string().empty(''),
            presence: Joi.array(),
            youtube: Joi.string().empty(''),
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(about);
        if (error) return res.status(400).json({ error });

        let files = about.files;
 
        if (files.length) {
                                
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                about.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }
                if(iteam.fieldName== 'blog'){
                    about.blog = files.filter(e => e.fieldName == 'blog').map(file => file._id); 
                }
             
           });
           
        }   else delete about.files;


        if(!about.presence)  about.presence = null;
        about.createdBy = req.user._id;
        about.updatedBy = req.user._id;
        
        about = new AboutModel(about);
        about = await about.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: about
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}


const get = async (req,res,next)=>{
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;

        let docs = await  AboutModel.find(query).populate('file', 'name original path thumbnail smallFile').populate('blog', 'name original path thumbnail smallFile');
        return res.status(200).send({
            status:CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}



const update = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "about id is required" });
        let about = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            title: Joi.string().required(),
            description :Joi.string().empty(''),
            files: Joi.array(),
            presenceTitle: Joi.string().empty(''),
            presenceDescription: Joi.string().empty(''),
            contactTitle: Joi.string().empty(''),
            contactDescription: Joi.string().empty(''),
            csrTitle: Joi.string().empty(''),
            csrDescription: Joi.string().empty(''),
            presence: Joi.array(),
            youtube: Joi.string().empty(''),
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(about);
        if (error) return res.status(400).json({ error });

        let files = about.files;
        if (files.length) {
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                about.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }
                if(iteam.fieldName== 'blog'){
                    about.blog = files.filter(e => e.fieldName == 'blog').map(file => file._id); 
                }
             
           });
        }
         delete about.files;

        if(about.file && about.file.length < 1) delete about.file;
        if(about.blog && about.blog.length < 1) delete about.blog;

        about.updatedBy = req.user._id;

        if(!about.presence)  about.presence = null;
     
        let aboutData = await AboutModel.updateOne({ _id: req.params.id }, {$set: about});
       
        if (!aboutData) return res.status(400).json({ error: "about heading update failed" });
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "about heading updated succesfully"
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

        await AboutModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "about Heading Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


// get method
const pageDetail = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        let record = { };

        record.heading    = await AboutModel.find({active:true},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile').populate('blog', 'name original path thumbnail smallFile');
       
        record.visionList   = await VisionModel.find({active:true},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sort_order: 1}).populate('file', 'name original path thumbnail smallFile');
        record.globalPresenceList    = await PresenceModel.find({active:true},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sort_order: 1}).populate('file', 'name original path thumbnail smallFile');
    
        record.keyContacts    = await TeamModel.find({active:true,type:'KEY'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sort_order: 1}).populate('file', 'name original path thumbnail smallFile');

        record.meta = await MetaModel.find({active:true,link:'about-us'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile');

        return res.status(200).send({
            status:CONSTANT.REQUESTED_CODES.SUCCESS,
            result: record
             });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


const createAward = async (req, res, next) => {
    let award = await FILE_UPLOAD.uploadMultipleFile(req);
    award.active = true;
    try {
        const schema = Joi.object({
            title: Joi.string().required(),
            shortdescription: Joi.string(),
            description: Joi.string(),
            active: Joi.boolean(),
            sort_order: Joi.number(),
            files: Joi.array(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(award);
        if (error) return res.status(400).json({ error });

        if (award.files.length) award.file = award.files.map(file => file._id);
        else delete award.files;

        award.createdBy = req.user._id;
        award.updatedBy = req.user._id;

        award = new AwardModel(award);
        award = await award.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: award
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getAward = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;

        let docs = await AwardModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs
          });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateAward = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "Award id is required"});
        let award = await FILE_UPLOAD.uploadMultipleFile(req);

        const schema = Joi.object({
            title: Joi.string().required(),
            shortdescription: Joi.string(),
            description: Joi.string(),
            active: Joi.boolean(),
            sort_order: Joi.number(),
            files: Joi.array(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        if (award.files.length) award.file = award.files.map(file => file._id);
        else delete award.files;
        req.body.updatedBy = req.user._id;

        award = await AwardModel.updateOne({_id: req.params.id}, {$set: req.body});
       
        if (!award) return res.status(400).json({error: "Award update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Award updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeAward = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await AwardModel.deleteOne({_id: req.params.id});
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Award Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};




const createjourney = async (req, res, next) => {
    let award = await FILE_UPLOAD.uploadMultipleFile(req);
    award.active = true;
    try {
        const schema = Joi.object({
            year: Joi.string().empty(),
            name: Joi.string().empty(),
            type: Joi.string().empty(),
            team: Joi.string().empty(''),
            description: Joi.string().empty(''),
            active: Joi.boolean(),
            sort_order: Joi.number(),
            files: Joi.array(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(award);
        if (error) return res.status(400).json({ error });

        if (award.files.length) award.file = award.files.map(file => file._id);
        else delete award.files;

        award.createdBy = req.user._id;
        award.updatedBy = req.user._id;

        award = new JourneyModel(award);
        award = await award.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: award
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getJourney = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;

        let docs = await JourneyModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile').populate('team','_id name');
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs            
           });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updatejourney = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "Award id is required"});
        let team = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
           
            name: Joi.string().empty(''),
            type: Joi.string().empty(''), 
            year: Joi.string().empty(''),
            team: Joi.string().empty(''),
            description: Joi.string().empty(''),
            active: Joi.boolean(),
            sort_order: Joi.number(),
            files: Joi.array(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        if (team.files.length) team.file = team.files.map(file => file._id);
        else delete team.files;
        req.body.updatedBy = req.user._id;

        team = await JourneyModel.updateOne({_id: req.params.id}, {$set: req.body});
       
        if (!team) return res.status(400).json({error: "Journey update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Journey updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removejourney = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await JourneyModel.deleteOne({_id: req.params.id});
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Journey Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};




const createContact = async (req, res, next) => {
    let award = await FILE_UPLOAD.uploadMultipleFile(req);

    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            designation: Joi.string().required(),
            description: Joi.string().empty(''),
            active: Joi.boolean().empty(''),
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

        award = new ContactModel(award);
        award = await award.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: award
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getContact = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : '');
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;

        let docs = await ContactModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs  
         });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateContact = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "Address id is required"});
        let team = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            name: Joi.string().required(),
            designation: Joi.string().required(),
            description: Joi.string().empty(''),
            active: Joi.boolean().empty(''),
            sort_order: Joi.number().empty(''),
            files: Joi.array(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        if (team.files.length) team.file = team.files.map(file => file._id);
        else delete team.files;
        req.body.updatedBy = req.user._id;

        team = await ContactModel.updateOne({_id: req.params.id}, {$set: req.body});
       
        if (!team) return res.status(400).json({error: "Address update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Address updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeContact = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await ContactModel.deleteOne({_id: req.params.id});
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Address Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};
//////////////////////////







////////////////////////////////////////

const createPresence = async (req, res, next) => {
    let help = await FILE_UPLOAD.uploadMultipleFile(req);
    help.active = true;
    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            description: Joi.string().empty(''),
            active: Joi.boolean(),
            sort_order: Joi.number(),
            files: Joi.array(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(help);
        if (error) return res.status(400).json({ error });

        if (help.files.length) help.file = help.files.map(file => file._id);
        else delete help.files;

        help.createdBy = req.user._id;
        help.updatedBy = req.user._id;

        help = new PresenceModel(help);
        help = await help.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: help
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getPresence = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;

        let docs = await PresenceModel.find(query).sort({createdAt: 1});
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs  
            });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updatePresence = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "Address id is required"});
        let team = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            name: Joi.string().required(),
            description: Joi.string().empty(''),
            active: Joi.boolean(),
            sort_order: Joi.number(),
            files: Joi.array(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        if (team.files.length) team.file = team.files.map(file => file._id);
        else delete team.files;
        req.body.updatedBy = req.user._id;

        team = await PresenceModel.updateOne({_id: req.params.id}, {$set: req.body});
       
        if (!team) return res.status(400).json({error: "Infra Help update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Infra Help updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removePresence = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await PresenceModel.deleteOne({_id: req.params.id});
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Infra help Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

///////////////////////


const createGallery = async (req, res, next) => {
    let gallery = await FILE_UPLOAD.uploadMultipleFile(req);

    try {
        const schema = Joi.object({
            status: Joi.number().empty(''),
            files: Joi.array(),
            customFields: Joi.object()
        });
    
        const { error } = schema.validate(gallery);
        if (error) return res.status(400).json({ error });

        if (gallery.files.length) gallery.file = gallery.files.map(file => file._id);
        else delete gallery.files;

        gallery.createdBy = req.user._id;
        gallery.updatedBy = req.user._id;

        gallery = new GalleryModel(gallery);
        gallery = await gallery.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: gallery
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const getGallery = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        if (query.name) query.name = new RegExp(query.name, "i");
        delete query.pagination;
        delete query.limit;

        let docs = await GalleryModel.find(query).sort({createdAt: -1}).limit(limit).skip(pagination*limit).populate('file', 'name original path thumbnail smallFile');
        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs  
         });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const updateGallery = async (req, res, next) => {
    
    try {
        if (!req.params.id) return res.status(400).json({error: "Address id is required"});
        let team = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            status: Joi.number().empty(''),
            files: Joi.array(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).json({ error });

        if (team.files.length) team.file = team.files.map(file => file._id);
        else delete team.files;
        req.body.updatedBy = req.user._id;

        team = await GalleryModel.updateOne({_id: req.params.id}, {$set: req.body});
       
        if (!team) return res.status(400).json({error: "Gallery update failed"});
        
        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Gallery updated succesfully"
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

        await GalleryModel.deleteOne({_id: req.params.id});
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Gallery Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};




////////////////////////////////




module.exports = {
    create,
    get,
    update,
    remove,
    getAward,
    createAward,
    updateAward,
    removeAward,
    getJourney,
    createjourney,
    updatejourney,
    removejourney,
    getContact,
    createContact,
    updateContact,
    removeContact,
    getPresence,   
    createPresence,
    updatePresence,
    removePresence,

    getGallery,
    createGallery,
    updateGallery,
    removeGallery ,

    pageDetail   
};