'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const ContactEnquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    type: { type: String, required: false, enum:['BLOG','COMPATATIVE'] },
    industry:{type:objectId,required:false, ref:"industry"},
    message: { type: String, required: false },
    pageName:{ type: String, required: false },
    active: { type: Boolean, default: true },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('compatative_enquiry', ContactEnquirySchema);