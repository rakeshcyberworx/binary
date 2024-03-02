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
    name: { type: String, required: true },
    slug: { type: String, required: false, default: "" },
  
    tag:[{type:objectId,required:false,ref:'whitePaperTag'}],
    publish:{type:String,required:false},
    link: { type: String, required: false, default: "" },
    shortDescription: { type: String, required: false },
    description: { type: String,required: false, default: "" },
    description2: { type: String,required: false, default: "" },
    showOnHome: { type: Number,required: false, default: 0 },
    specification:[SpecificationsSchema],
    file: { type: objectId, ref: 'File' },
    topName: { type: String,required: false, default: "" },
    thumbnail: { type: objectId, ref: 'File' },
    metaTitle: { type: String,required: false, default: "" },
    metaKeyword: { type: String,required: false, default: "" },
    metaDescription: { type: String,required: false, default: "" },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('whitePaper', BlogSchema);