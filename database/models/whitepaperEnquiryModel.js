'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const ContactEnquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    whitepaper: { type: objectId, required: true, ref:"whitePaper" },
    email: { type: String, required: true },
    concern: { type: String, required: false },
    active: { type: Boolean, default: true },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('whitepaper_enquiry', ContactEnquirySchema);