'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const CareerEnquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: false },
    phone: { type: String,required: false, default: "" },
    file: { type: objectId, ref: 'File' },
    jobs: { type: objectId,ref: 'career' , required: false},
    appliedFor: { type: String,required: false, default: "" },
    type: { type: String,required: false, default: "" , enum:['JOBS','OTHER'] },
    state: { type: objectId,ref: 'states' },
    city: { type: String, default: false },
    currentRole: { type: String, default: false },
    currentCompany: { type: String, default: false },
    message: { type: String, default: false },

    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('job_apply', CareerEnquirySchema);