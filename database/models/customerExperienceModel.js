'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;


const SpecificationsSchema = new mongoose.Schema({
    _id: false,
    name: { type: String, required: false, default: '' },
    description: { type: String, required: false, default: '' },
}, { timestamps: false, versionKey: false });



const serviceShcema = new mongoose.Schema({ 
    
    name: { type: String, required: true },
    file: { type: objectId, ref: 'File' },
    thumbnail: { type: objectId, ref: 'File' },
    featureImage: { type: objectId, ref: 'File' },
    sortOrder: {type: Number, require:false,default:0},

    slug: { type: String, required: false, default: "" },

    shortDescription: { type: String, required: false,default:" " },
    bannerTitle: { type: String, required: false,default:" " },
    offeringDescription: { type: String, required: false,default:" " },
    description: { type: String, required: false,default:" " },
    bannerDescription: { type: String, required: false,default:" " },
    benafitTitle: { type: String, required: false,default:" " },
    metaTitle: { type: String, required: false,default:" " },
    metaKeyword: { type: String, required: false,default:" " },
    metaDescription: { type: String, required: false,default:" " },
    benafitDescription: { type: String, required: false,default:" " },
    offeringTitle: { type: String, required: false,default:" " },
    processTitle: { type: String, required: false,default:" " },
    processDescription: { type: String, required: false,default:" " },
    formTitle: { type: String, required: false,default:" " },
    formDescription: { type: String, required: false,default:" " },

    specification:[SpecificationsSchema],

    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('customer_experience', serviceShcema);