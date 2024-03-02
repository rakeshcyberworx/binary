'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const serviceShcema = new mongoose.Schema({ 
    
    solutionId: { type: objectId, required: true,ref:"solutionHome" },
    name: { type: String, required: true },
    thumbnail: { type: objectId, ref: 'File' },
    sortOrder: {type: Number, require:false,default:0},
    slug: { type: String, required: false, default: "" },
    shortDescription: { type: String, required: false,default:" " },
    children:[{ type: objectId, ref:'solutionHomeList',required: false,default:" " }],
 
    imagePosition: { type: String, required: false,default:" " },
    imageWidth: { type: String, required: false,default:" " },
    description: { type: String, required: false,default:" " },
    isHidden:{ type: Boolean, default: false },
    imageOneThird:{ type: Boolean, default: false },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('solutionHomeList', serviceShcema);