'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const CitySchema = new mongoose.Schema({ 
    name: { type: String, required: true },
    file: { type: objectId, ref: 'File' },
    slug: { type: String, required: false, default: "" },
    rerano: { type: String, required: false },
    rera: { type: String, required: false },
    description: { type: String, required: false},
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('city', CitySchema);