'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const SettingSchema = new mongoose.Schema({ 
    store_name: { type: String, required: true },
    meta_title: { type: String, required: false },
    meta_description: { type: String, required: false },
    meta_keyword: { type: String, required: false },
    email: { type: String, required: false },
    telephone: { type: String, required: false },
    alternate: { type: String, required: false },
    address: { type: String, required: false },
    google_iframe: { type: String, required: false },  
    footer_note: { type: String, required: false },
    copywrite: { type: String, required: false },
    facebook: { type: String, required: false },
    twitter: { type: String, required: false },
    linkedin: { type: String, required: false },
    pinterest: { type: String, required: false },
    instagram: { type: String, required: false },
    youtube: { type: String, required: false },
    whatsapp: { type: String, required: false },

    formTitle: { type: String, required: false },
    formDescription: { type: String, required: false },
    banner: { type: String, required: false },
    bannerTitle: { type: String, required: false },
    bannerDescription: { type: String, required: false },
    termLine: { type: String, required: false },
    termDescription: { type: String, required: false },
      
    logo: { type: objectId, ref: 'File' },
    footer_logo: { type: objectId, ref: 'File' },
    favicon: { type: objectId, ref: 'File' },
    default_logo: { type: objectId, ref: 'File' },
    formImage: { type: objectId, ref: 'File' },

    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('setting', SettingSchema);