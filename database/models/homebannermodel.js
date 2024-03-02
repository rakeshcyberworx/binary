'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const HomeBannerSchema = new mongoose.Schema({ 
    title: { type: String, required: true },
    description: { type: String, required: false },
    sortOrder: { type: Number, required: false },
    file: { type: objectId, ref: 'File' },
    mobile: { type: objectId, ref: 'File' },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Home_banner', HomeBannerSchema);