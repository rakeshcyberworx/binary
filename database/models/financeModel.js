'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;


const counters = mongoose.Schema({
    _id:false,
    name:{type:String,required:false},
    value:{type:String,required:false},  
    isText:{type:Boolean,required:false,default:false}  
})

const SpecificationsSchema = new mongoose.Schema({
    _id: false,
    name: { type: String, required: false, default: '' },
    description: { type: String, required: false, default: '' },
}, { timestamps: false, versionKey: false });


const serviceShcema = new mongoose.Schema({ 
    name: { type: String, required: true },
    file: { type: objectId, ref: 'File' },
    thumbnail: { type: objectId, ref: 'File' },
    hoverImage: { type: objectId, ref: 'File' },
    sortOrder: {type: Number, require:false,default:0},
    slug: { type: String, required: false, default: "" },
    bottomDescription: { type: String, required: false,default:" " },
    ctaDescription: { type: String, required: false,default:" " },
    shortDescription: { type: String, required: false,default:" " },
    specification:[SpecificationsSchema],
    description: { type: String, required: false,default:" " },
    metaTitle: { type: String, required: false,default:" " },
    tagLine: { type: String, required: false,default:" " },
    metaKeyword: { type: String, required: false,default:" " },
    metaDescription: { type: String, required: false,default:" " },
  
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('finance', serviceShcema);