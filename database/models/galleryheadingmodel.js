'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const GalleryHeadingSchema = new mongoose.Schema({ 
    name: {type: String, required: true},
    description: {type: String, required: false},
    vtitle: {type: String, required: false},
    vdescription: {type: String, required: false},
    ltitle: {type: String, required: false},
    ldescription: {type: String, required: false},
    status: { type: Number, default: false },
    file: { type: objectId, ref: 'File' },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('gallery_heading', GalleryHeadingSchema);