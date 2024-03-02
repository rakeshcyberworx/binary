'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const MetaSchema = new mongoose.Schema({ 
    name: { type: String, required: true },
    file: { type: objectId, ref: 'File' },
    blog: { type: objectId, ref: 'File' },
    title: { type: String, required: false},
    description: { type: String, required: false},
    title1: { type: String, required: false},
    description1: { type: String, required: false},
    title2: { type: String, required: false},
    description2: { type: String, required: false},
    title3: { type: String, required: false},
    description3: { type: String, required: false},
    meta_title: { type: String, required: false},
    meta_description: { type: String, required: false},
    meta_keyword: { type: String, required: false},
    ctaDescription: { type: String, required: false},
    link: { type: String, required: false},
    active: { type: Boolean, default: false },
    sort_order: { type: Number, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('meta', MetaSchema);