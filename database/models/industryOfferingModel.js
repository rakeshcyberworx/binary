'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;


const SpecificationsSchema = new mongoose.Schema({
    _id: false,
    name: { type: String, required: false, default: '' },
    value: { type: String, required: false, default: '' },
}, { timestamps: false, versionKey: false });


const serviceShcema = new mongoose.Schema({ 

    
    industryId: { type: objectId, required: true,ref:"industry" },
    name: { type: String, required: true },
    file: { type: objectId, ref: 'File' },
    thumbnail: { type: objectId, ref: 'File' },
    sortOrder: {type: Number, require:false,default:0},
    slug: { type: String, required: false, default: "" },
    shortDescription: { type: String, required: false,default:" " },
    description: { type: String, required: false,default:" " },
    metaTitle: { type: String, required: false,default:" " },
    metaKeyword: { type: String, required: false,default:" " },
    metaDescription: { type: String, required: false,default:" " },
    specification:[SpecificationsSchema],
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('industryOffering', serviceShcema);