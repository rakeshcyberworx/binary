'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const Schema = new mongoose.Schema({
  
    partnerName: { type: String, required: true },
    partnerDescription: { type: String, required: false, default: "" },
    employeeName: { type: String,required: false, default: "" },
    employeeDescription: { type: String,required: false, default: "" },
    clientName: { type: String,required: false, default: "" },
    clientDescription: { type: String,required: false, default: "" },
    caseName: { type: String,required: false, default: "" },
    caseDescription: { type: String,required: false, default: "" },
    file: { type: objectId, ref: 'File' },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('business_heading', Schema);