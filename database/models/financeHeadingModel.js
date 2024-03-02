'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const SpecificationsSchema = new mongoose.Schema({
    _id: false,
    name: { type: String, required: false, default: '' },
    description: { type: String, required: false, default: '' },
}, { timestamps: false, versionKey: false });


const serviceShcema = new mongoose.Schema({ 
    title: { type: String, required: true },
    file: { type: objectId, ref: 'File' },
    shortDescription: { type: String, required: false,default:" " },
    ctaDescription: { type: String, required: false,default:" " },
    specification:[SpecificationsSchema],
  
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('financeHeading', serviceShcema);