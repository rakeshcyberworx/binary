'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;


const SpecificationsSchema = new mongoose.Schema({
    _id: false,
    name: { type: String, required: false, default: '' },
    description: { type: String, required: false, default: '' },
    symbol: { type: String, required: false, default: '' },
}, { timestamps: false, versionKey: false });


const AboutSchema = new mongoose.Schema({
    title: { type: String, required: false },
    description: { type: String, required: false },
    presenceTitle: { type: String, required: false },
    presenceDescription: { type: String,required: false, default: "" },
    contactTitle: { type: String,required: false, default: "" },
    contactDescription: { type: String, required: false },
    csrTitle: { type: String, required: false },
    csrDescription: { type: String, required: false },
    youtube: { type: String, required: false },
    presence:[SpecificationsSchema],
    file: { type: objectId, ref: 'File' },
    blog: { type: objectId, ref: 'File' },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('about', AboutSchema);