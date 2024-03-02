'use strict';

const { string } = require('joi');
const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;



const SpecificationsSchema = new mongoose.Schema({
    _id: false,
    name: { type: String, required: false, default: '' },
    description: { type: String, required: false, default: '' },
}, { timestamps: false, versionKey: false });


const BlogSchema = new mongoose.Schema({
    solutionServiceId:{type:objectId,ref:'solutionService'},
    solutionId:{type:objectId,ref:'Solution'},
    // type:{type:String,required:true,enum:['STUDY','INDUSTRY']},
    name: { type: String, required: true },
    slug: { type: String, required: false, default: "" },
  
    tag:[{type:objectId,required:false,ref:'storyTag'}],
    publish:{type:String,required:false},
    link: { type: String, required: false, default: "" },
    shortDescription: { type: String, required: false },
    description: { type: String,required: false, default: "" },
    description2: { type: String,required: false, default: "" },
    showOnHome: { type: Number,required: false, default: 0 },
    specification:[SpecificationsSchema],

    whyTitle: { type: String, required: false },
    whyHeading: { type: String, required: false },
    whyDescription: { type: String, required: false },

    file: { type: objectId, ref: 'File' },
    whyImage: { type: objectId, ref: 'File' },
    thumbnail: { type: objectId, ref: 'File' },
    metaTitle: { type: String,required: false, default: "" },
    metaKeyword: { type: String,required: false, default: "" },
    metaDescription: { type: String,required: false, default: "" },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('story', BlogSchema);