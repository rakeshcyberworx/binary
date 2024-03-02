'use strict';

const modelName                     = 'home';
const Joi                           = require('@hapi/joi');
const { HomeModel,
    SolutionModel,
    SolutionServiceModel,
    StoryModel,
    BlogModel,
    whyChooseModel,
    HomeBannerModel,
    TopLocalityModel,
    SolutionOverviewModel,
    MetaModel,
    SolutionHomeModel,
SolutionHomeListModel,
    TestimonialModel,
    ServiceModel,
ServiceOfferingModel,


    OtpModel }                      = require('@database');
const CONSTANT                      = require('@lib/constant');
const UTILS                         = require('@lib/utils');
const FILE_UPLOAD                   = require('@lib/file_upload');
const { result }                    = require('@hapi/joi/lib/base');
const msg91                         = require("msg91-api")("343914ABecqB83V6bZ63199dfeP1");
const moment                        = require('moment');
const ejs                           = require('ejs');
const fs                            = require('fs');
const path                          = require('path');
const mail                          = require('@lib/mailer');

const create = async (req, res, next) => {
 
    let home = await FILE_UPLOAD.uploadMultipleFile(req);
    home.active = true;
    try {
        const schema = Joi.object({
            solutionTitle :Joi.string().required(),  
            solutionDescription :Joi.string().empty(''),  
            whyCustomerTitle:Joi.string().empty(''), 
            whyCustomerDescription:Joi.string().empty(''),  
            storieTitle:Joi.string().empty(''),         
            storieDescription:Joi.string().empty(''),  
            technologyTitle:Joi.string().empty(''),   
            technologyDescription:Joi.string().empty(''),  
            youtubeLink:Joi.string().empty(''),  

            active:Joi.boolean(), 
            files: Joi.array(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(home);
        if (error) return res.status(400).json({ error });

     
        let files = home.files;
        if (files.length) {

     
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    home.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }

                if(iteam.fieldName== 'blog'){
                    home.blog = files.filter(e => e.fieldName == 'blog').map(file => file._id); 
                }
                        
           });  

        } else delete home.files;

   
        home.createdBy = req.user._id;
        home.updatedBy = req.user._id;
        
        home = new HomeModel(home);
        home = await home.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: home
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

        let docs =  await HomeModel.find(query).populate('file','name thumbnail path').populate('blog','name thumbnail path');
  
       
        return res.status(200).send({
            success:CONSTANT.REQUESTED_CODES.SUCCESS,            
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const update = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "home id is required" });
        let home = await FILE_UPLOAD.uploadMultipleFile(req);
        const schema = Joi.object({
            solutionTitle :Joi.string().required(),  
            solutionDescription :Joi.string().empty(''),
            whyCustomerTitle:Joi.string().empty(''), 
            whyCustomerDescription:Joi.string().empty(''),  
            storieTitle:Joi.string().empty(''),         
            storieDescription:Joi.string().empty(''),  
            technologyTitle:Joi.string().empty(''),   
            technologyDescription:Joi.string().empty(''),  
            youtubeLink:Joi.string().empty(''),    

            active:Joi.boolean(), 
            files: Joi.array(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(home);
        if (error) return res.status(400).json({ error });

        let files = home.files;
        if (files.length) {
            
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    home.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }
                
                if(iteam.fieldName== 'blog'){
                    home.blog = files.filter(e => e.fieldName == 'blog').map(file => file._id); 
                }
                        
           });  
        } else delete home.files;

        if(home.file && home.file.length < 1) delete home.file;
        if(home.blog && home.blog.length < 1) delete home.blog;

        home.updatedBy = req.user._id;

        let homeData = await HomeModel.updateOne({ _id: req.params.id }, {$set: home });
        if (!homeData) return res.status(400).json({ error: "home heading update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "home updated succesfully"
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

        await HomeModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "home Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


//////////////////////


const getwhyChoose = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;

        let docs    = await whyChooseModel.find(query).sort({createdAt: -1})
        .populate('file', 'name original path thumbnail smallFile');

        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const createwhyChoose = async (req, res, next) => {
    let whychoose = await FILE_UPLOAD.uploadMultipleFile(req);
    whychoose.active = true;
    
    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            description: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            files: Joi.array(),
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(whychoose);
        if (error) return res.status(400).json({ error });

        let files = whychoose.files;
        if (files.length) {
            whychoose.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete whychoose.files;

        whychoose.createdBy = req.user._id;
        whychoose.updatedBy = req.user._id;
        
        whychoose = new whyChooseModel(whychoose);
        whychoose = await whychoose.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: whychoose
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}


const updatewhyChoose = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "id is required" });
        let whychoose = await FILE_UPLOAD.uploadMultipleFile(req);
        
        const schema = Joi.object({
            name: Joi.string().required(),
            description: Joi.string().empty(''),
            sortOrder: Joi.number().empty(''),
            files: Joi.array(),
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(whychoose);
        if (error) return res.status(400).json({ error });

        let files = whychoose.files;
        if (files.length) {
            whychoose.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
        }else delete whychoose.files;

        if(whychoose.file && whychoose.file.length < 1) delete whychoose.file;

        whychoose.updatedBy = req.user._id;

        let whychooseData = await whyChooseModel.updateOne({ _id: req.params.id }, {$set: whychoose} );          
   
        if (!whychooseData) return res.status(400).json({ error: "why choose update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "why choose updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removewhyChoose = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await whyChooseModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Home Benafits Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};



///////////////////////////////



const getHomeBanner = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;

        let docs    = await HomeBannerModel.find(query).sort({createdAt: -1})
        .populate('file', 'name original path thumbnail smallFile').populate('mobile', 'name original path thumbnail smallFile');

        return res.status(200).send({ 
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: docs });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const createHomeBanner = async (req, res, next) => {
    let homebanner = await FILE_UPLOAD.uploadMultipleFile(req);
    
    try {
        const schema = Joi.object({
            title: Joi.string().empty(''),
            description: Joi.string().empty(''),
            sortOrder: Joi.string().empty(''),
            files: Joi.array(),
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(homebanner);
        if (error) return res.status(400).json({ error });

        let files = homebanner.files;
        if (files.length) {
       
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    homebanner.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }

                if(iteam.fieldName== 'blog'){
                    homebanner.mobile = files.filter(e => e.fieldName == 'blog').map(file => file._id); 
                }
               
           });   
       
       
        } else delete homebanner.files;

        homebanner.createdBy = req.user._id;
        homebanner.updatedBy = req.user._id;
        
        homebanner = new HomeBannerModel(homebanner);
        homebanner = await homebanner.save();

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: homebanner
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}


const updateHomeBanner = async (req, res, next) => {
    try {
        if (!req.params.id) return res.status(400).json({ error: "home Banner id is required" });
        let homebanner = await FILE_UPLOAD.uploadMultipleFile(req);
        
        const schema = Joi.object({
            title: Joi.string().empty(''),
            description: Joi.string().empty(''),
            sortOrder: Joi.string().empty(''),
            files: Joi.array(),
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(homebanner);
        if (error) return res.status(400).json({ error });

        let files = homebanner.files;
   
        if (files.length) {
            files.forEach((iteam)=>{
                if(iteam.fieldName== 'file'){
                    homebanner.file = files.filter(e => e.fieldName == 'file').map(file => file._id);
                }

                if(iteam.fieldName== 'blog'){
                    homebanner.mobile = files.filter(e => e.fieldName == 'blog').map(file => file._id); 
                }
               
           });   
        } else delete homebanner.files;

        if(homebanner.file && homebanner.file.length < 1) delete homebanner.file;
        if(homebanner.blog && homebanner.blog.length < 1) delete homebanner.blog;

        homebanner.updatedBy = req.user._id;
                       
        let homebannerData = await HomeBannerModel.updateOne({ _id: req.params.id }, {$set: homebanner} );
        if (!homebannerData) return res.status(400).json({ error: "home Banner update failed" });

        return res.status(201).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "home Banner updated succesfully"
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

const removeHomeBanner = async (req, res, next) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = schema.validate(req.params);
        if (error) return res.status(400).json({ error });

        await HomeBannerModel.deleteOne({ _id: req.params.id });
        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: "Home Benafits Deleted succesfully" 
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


////////////////////////




const sentOtp = async (req, res, next) => {
    let sendOtp = req.body;
    let randomNumber = await UTILS.getRandomNumber();
    try {
        const schema = Joi.object({
            number: Joi.number().required(),
        });

        const { error } = schema.validate(sendOtp);
        if (error) return res.status(400).json({ error });

        var args = {
            "flow_id": "6319a189aed1b13a913072a6",
            "sender": "KISANT",
            "mobiles": sendOtp.number, 
            "OTP": randomNumber,
            "short_url": 1
          };
          let otp = {
            type: "OTP",
            token: randomNumber,
            mobile: sendOtp.number,
            expiry: moment().add(10, 'm').valueOf(),
            active: true
        };
       
        await OtpModel.deleteOne({mobile: sendOtp.number});
        otp = new OtpModel(otp);
        otp = await otp.save();
          msg91.sendSMS(args, function(err, response){
              if(response.type == 'success') return res.status(200).send({result :"OTP sent successfully",status: CONSTANT.REQUESTED_CODES.SUCCESS})
            
          });
          
          
   
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const verifyOtp = async (req, res, next) => {
    let verifyOtp = req.body;
    try {
        const schema = Joi.object({
            number: Joi.number().required(),
            token: Joi.number().required(),

        });

        const { error } = schema.validate(verifyOtp);
        if (error) return res.status(400).json({ error });
        const otp = await OtpModel.findOne({mobile: req.body.number, token: req.body.token, active: true});
        if (!otp) return res.status(400).send({error: "Your OTP is not valid!"});
        if (otp.expiry < moment().valueOf()) return res.status(400).send({error: "OTP valid only for 10 minutes. Request for new OTP!"});
       
        await OtpModel.deleteOne({mobile: req.body.number});
        return res.status(200).send({result :"OTP verify successfully", status: CONSTANT.REQUESTED_CODES.SUCCESS})
       
          
   
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}

const sentMessage = async (req, res, next) => {
    let sendOtp = req.body;
    let randomNumber = await UTILS.getRandomNumber();
    try {
        const schema = Joi.object({
            number: Joi.number().required(),
        });

        const { error } = schema.validate(sendOtp);
        if (error) return res.status(400).json({ error });

        var args = {
            "flow_id": "63284651aa2eb70ea4747534",
            "sender": "KISANT",
            "mobiles": sendOtp.number, 
            "name":"yasin",
            "id":"abc",
            "url":"websiteurl",
            "short_url": 1
          };
          
       
        
          msg91.sendSMS(args, function(err, response){
              if(response.type == 'success') return res.status(200).send({result :"Message sent successfully",status: CONSTANT.REQUESTED_CODES.SUCCESS})
            
          });
          
          
   
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}


/////////////////////////
const saveapply = async (req, res, next) => {
    let apply = await FILE_UPLOAD.uploadMultipleFile(req);
    apply.active = true;
    
    try {
        const schema = Joi.object({
            firstName: Joi.string().required(),
            LastName: Joi.string().required(),
            mobile: Joi.number().required(),
            email: Joi.string().required(),
            addrress: Joi.string().empty(''),
            state: Joi.string().required(''),
            city: Joi.string().empty(''),
            occupation: Joi.string().empty(''),
            loanApplied: Joi.string().empty(''),
            files: Joi.array(),
            active: Joi.boolean(),
            customFields: Joi.object()
        });

        const { error } = schema.validate(apply);
        if (error) return res.status(400).json({ error });

        let files = apply.files;
        if (files.length) {
            apply.files = files.filter(e => e.fieldName == 'file').map(file => file._id);
        } else delete apply.files;
        
        apply = new ApplyModel(apply);
        apply = await apply.save();

        if(apply.firstName){
            let enq = await ApplyModel.find({_id:apply._id}).populate('state', '_id name ').populate('loanApplied','_id name ');
          
            let compiled = ejs.compile(fs.readFileSync(path.resolve(__dirname, '../../docs/email_templates/applyonline.ejs'), 'utf8')),
            dataToCompile = {
                firstName:enq[0].firstName,
                LastName:enq[0].LastName,
                mobile:enq[0].mobile,
                email:enq[0].email,
                addrress:enq[0].addrress,
                state:enq[0].state.name,
                city:enq[0].city,
                occupation:enq[0].occupation,
                product:enq[0].loanApplied.name,
                               
            };
        
        await mail.sendMail([process.env.ENQUIRY_MAIL], `You have new Apply Online Enquiry `, compiled(dataToCompile));
        }

        return res.status(200).send({
            status: CONSTANT.REQUESTED_CODES.SUCCESS,
            result: apply
        });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
}
//////////////////////


const pageDetail = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        let record = { };
        record.homeHeading       = await HomeModel.find({active:true},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).populate('file','name original path thumbnail smallFile').populate('blog','name original path thumbnail smallFile');

        record.bannerList  = await HomeBannerModel.find({active:true},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1})
        .populate('file', 'name original path thumbnail smallFile').populate('mobile', 'name original path thumbnail smallFile');
       
        // let solutions = await SolutionModel.find({active:true},{name:1,slug:1,_id:1,shortDescription:1}).sort({sortOrder: 1});
      
        // let solutionService = await SolutionServiceModel.find({active:true},{name:1,slug:1,_id:1,shortDescription:1,solutionId:1,imagePosition:1,imageWidth:1,isHidden:1}).sort({sortOrder: 1}).populate('file', 'name original path thumbnail smallFile').populate('children',{name:1,slug:1,_id:1,shortDescription:1,solutionId:1,imagePosition:1,imageWidth:1});
        

        // record.solutionList = UTILS.cloneObject(solutions).filter(e => e._id).map(doc => {
        //     doc.servicesDetail = (solutionService || []).filter(e => e.solutionId && doc._id && e.solutionId.toString() == doc._id.toString()) || [];
        //     return doc;
        //    });


           let allsolution = await SolutionHomeModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1});

           let solutionService = await SolutionHomeListModel.find({active:true},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1}).populate('thumbnail', 'name original path thumbnail smallFile').populate('children',{name:1,slug:1,_id:1,shortDescription:1,solutionId:1,imagePosition:1,imageWidth:1});
   
         
           record.solutionList = UTILS.cloneObject(allsolution).filter(e => e._id).map(doc => {
               doc.servicesDetail = (solutionService || []).filter(e => e.solutionId && doc._id && e.solutionId.toString() == doc._id.toString()) || [];
               return doc;
              });

      
        record.storyList = await StoryModel.find({active:true,showOnHome:1},{_id:1,name:1,slug:1,tag:1,link:1,shortDescription:1}).sort({sortOrder: 1})
        .populate('thumbnail', 'name original path thumbnail smallFile')
        .populate('tag', '_id name')
        ;
       
        record.whyChooseList    = await whyChooseModel.find(query,{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).sort({sortOrder: 1})
        .populate('file', 'name original path thumbnail smallFile');

        record.meta = await MetaModel.find({active:true,link:'home'},{createdBy:0,updatedBy:0,createdAt:0,updatedAt:0}).populate('file', 'name original path thumbnail smallFile');
       
        return res.status(200).send({
            success:CONSTANT.REQUESTED_CODES.SUCCESS,            
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};


/////////



const search = async (req, res, next) => {
    try {
        const limit = parseInt(req.query && req.query.limit ? req.query.limit : 10);
        const pagination = parseInt(req.query && req.query.pagination ? req.query.pagination : 0);
        let query = req.query;
        delete query.pagination;
        delete query.limit;
        query.active = true;

        if (query.search) query.name = new RegExp(query.search, "i");
        delete query.search;
        let record = {};
        
        query.hideHome=false;
           
        record.solution = await SolutionModel.find(query,{name:1,slug:1,_id:1,sortOrder:1}).sort({name: 1});
      
        query.hideHome=true;
      
        let solutionHideTrueHome = await SolutionModel.find({hideHome:true});
        let solutionids = [];
        if(solutionHideTrueHome.length){
            solutionids = solutionHideTrueHome.map(e=>e._id)
            
        query['solutionId']={$nin:solutionids}
        }

        delete query.hideHome;
          
        record.solutionService = await SolutionServiceModel.find(query,{name:1,slug:1,_id:1}).sort({name: 1});
        
        record.SolutionOverview = await SolutionOverviewModel.find(query,{name:1,_id:1,sortOrder:1}).sort({name: 1}).populate('solutionServiceId','_id name slug');
            
        delete query.solutionId;
        
        record.service = await ServiceModel.find(query,{name:1,slug:1,_id:1,sortOrder:1}).sort({name: 1});
           
        record.serviceOffering = await ServiceOfferingModel.find(query,{name:1,slug:1,_id:1}).sort({name: 1});

        record.serviceOfferingSpecification = await ServiceOfferingModel.find({specification:{ $elemMatch: 
            { name:query.name }}} ,{'specification.name':1,'slug':1}).sort({'specification.name': 1});

        record.blog = await BlogModel.find(query,{name:1,slug:1,_id:1}).sort({name: 1});   
        record.story = await  StoryModel.find(query,{name:1,slug:1,_id:1}).sort({name: -1});

             
        return res.status(200).send({
            success:CONSTANT.REQUESTED_CODES.SUCCESS,            
            result: record });
    } catch (error) {
        return res.status(400).json(UTILS.errorHandler(error));
    }
};

/////////////////












module.exports = {
    create,
    get,
    update,
    remove,  
    getwhyChoose,
    createwhyChoose,
    updatewhyChoose,
    removewhyChoose,
    getHomeBanner,
    createHomeBanner,
    updateHomeBanner,
    removeHomeBanner,
   
    sentOtp,
    verifyOtp,
    saveapply,
    sentMessage,
    pageDetail,
    search
};