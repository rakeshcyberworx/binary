'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const SolutionSchema = new mongoose.Schema({ 
    name: { type: String, required: true },

    bannerTitle: { type: String, required: false },
    bannerDescription: { type: String, required: false },

    file: { type: objectId, ref: 'File' },
    slug: { type: String, required: true, default: "" },
    description: { type: String, required: false,default:" " },
    hideHome:{ type: Boolean, required: false, default:false },
    shortDescription:{type: String, required: false,default:" "},
    sortOrder:{type: Number, required: false,default:" "},
    metaTitle: { type: String, required: false,default:" " },
    metaKeyword: { type: String, required: false,default:" " },
    metaDescription: { type: String, required: false,default:" " },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Solution', SolutionSchema);