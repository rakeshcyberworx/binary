'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const serviceShcema = new mongoose.Schema({ 

    
    solutionId: { type: objectId, required: true,ref:"Solution" },
    name: { type: String, required: true },
    file: { type: objectId, ref: 'File' },
    thumbnail: { type: objectId, ref: 'File' },
    sortOrder: {type: Number, require:false,default:0},
    slug: { type: String, required: false, default: "" },
    shortDescription: { type: String, required: false,default:" " },
    innerDescription: { type: String, required: false,default:" " },
    ctaDescription: { type: String, required: false,default:" " },
    isHidden:{ type: Boolean, required: false,default:" " },
    children:[{ type: objectId, ref:'solutionService',default:false }],
    overViewDescription: { type: String, required: false,default:" " },
    overViewTitle: { type: String, required: false,default:" " },
    caseTitle: { type: String, required: false,default:" " },
    caseDescription: { type: String, required: false,default:" " },
    imagePosition: { type: String, required: false,default:" " },
    imageWidth: { type: String, required: false,default:" " },
    description: { type: String, required: false,default:" " },
    metaTitle: { type: String, required: false,default:" " },
    metaKeyword: { type: String, required: false,default:" " },
    metaDescription: { type: String, required: false,default:" " },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('solutionService', serviceShcema);