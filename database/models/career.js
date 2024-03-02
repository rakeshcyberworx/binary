'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const CareerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: { type: String, required: false },
    location: { type: String,required: false, default: "" },
    experience: { type: String,required: false, default: "" },
    compensation: { type: String,required: false, default: "" },
    jobType: { type: String,required: false, default: "" },
    posted: { type: String,required: false, default: "" },
    file: { type: objectId, ref: 'File' },
    vacancy: { type: String,required: false, default: "" },
    description: { type: String,required: false, default: "" },
    sort_order: { type: Number, default: false },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('career', CareerSchema);