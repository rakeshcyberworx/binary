'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const EnquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: false },
    pageName: { type: String, required: false },
    industry: { type: objectId, required: false,ref:'industry' },
    interest: [{ type: String, required: false }],
    email: { type: String, required: true },
    concern: { type: String, required: false,default:'' },
    active: { type: Boolean, default: true },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('enquiry', EnquirySchema);