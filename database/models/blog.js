'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const BlogSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: false, default: "" },
  
    category:[{type:objectId,required:false,ref:'blog_category'}],
    solutionId:{type:objectId,required:false,ref:'Solution'},
    serviceId:{type:objectId,required:false,ref:'service'},
    publish:{type:String,required:false},
    link: { type: String, required: false, default: "" },
    shortDescription: { type: String, required: false },
    location: { type: String, required: false },
    description: { type: String,required: false, default: "" },
    feature: { type: Number,required: false, default: 0 },
    eventType:{type:String,required:false,default:null,enum:['PAST','UPCOMING',null]},
    file: { type: objectId, ref: 'File' },
    type:{type:String,required:false,enum:['BLOGS','EVENTS','PRESS']},
    thumbnail: { type: objectId, ref: 'File' },
    metaTitle: { type: String,required: false, default: "" },
    metaKeyword: { type: String,required: false, default: "" },
    metaDescription: { type: String,required: false, default: "" },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('blog', BlogSchema);