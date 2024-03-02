'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;


const counters = mongoose.Schema({
    _id:false,
    name:{type:String,required:false},
    value:{type:String,required:false},  
    isText:{type:Boolean,required:false,default:false}  
})

const serviceShcema = new mongoose.Schema({ 
    name: { type: String, required: true },
    file: { type: objectId, ref: 'File' },
    thumbnail: { type: objectId, ref: 'File' },
    hoverImage: { type: objectId, ref: 'File' },
    sortOrder: {type: Number, require:false,default:0},
    slug: { type: String, required: false, default: "" },
    shortDescription: { type: String, required: false,default:" " },
    bannerTitle: { type: String, required: false,default:" " },
    bannerDescription: { type: String, required: false,default:" " },
    ctaDescription: { type: String, required: false,default:" " },
    bestTitle: { type: String, required: false,default:" " },
    bestDescription: { type: String, required: false,default:" " },
    bestPractice: [{ type: String, required: false,default:'' }],
    description: { type: String, required: false,default:" " },
    metaTitle: { type: String, required: false,default:" " },
    metaKeyword: { type: String, required: false,default:" " },
    metaDescription: { type: String, required: false,default:" " },
    serviceTitle: { type: String, required: false,default:" " },
    serviceDescription: { type: String, required: false,default:" " },
    counters:[counters],
    offerings:[{type:objectId,required:false,ref:'serviceOffering'}],
    solutionService:[{type:objectId,required:false,ref:'solutionService'}],
    solutionList:[{type:objectId,required:false,ref:'Solution'}],
    serviceList:[{type:objectId,required:false,ref:'service'}],
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('industry', serviceShcema);