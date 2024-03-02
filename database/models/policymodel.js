'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const PolicySchema = new mongoose.Schema({ 
    title: { type: String, required: true },
    status: { type: Number, default: false },
    link: { type: String, required: false,default: false },
    category: { type: objectId, ref: 'policy_category' },
    file: { type: objectId, ref: 'File' },
    sort_order: { type: Number, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('policy', PolicySchema);