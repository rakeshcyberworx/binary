'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const doNextSchema = new mongoose.Schema({
    _id: false,
    name: { type: String, required: false, default: '' },
}, { timestamps: false, versionKey: false });

const locationList = new mongoose.Schema({
    _id: false,
    heading: { type: String, required: false, default: '' },
    address: { type: String, required: false, default: '' },
    phone: { type: String, required: false, default: '' },
    email: { type: String, required: false, default: '' },
}, { timestamps: false, versionKey: false });


const ContactHeadingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: false },
    termsLine: { type: String, required: false },
    termDescription: { type: String, required: false },
    email: { type: String, required: false },
    doNext: [{ type: String, required: false }],
    locationList: [locationList],
    interestList: [{ type: String, required: false }],
   
    file:{type: objectId , ref:'File'},
    active: { type: Boolean, default: false },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('contact_heading', ContactHeadingSchema);