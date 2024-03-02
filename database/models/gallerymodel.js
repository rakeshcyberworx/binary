'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const GallerySchema = new mongoose.Schema({ 
    active: { type: Boolean, default: false },
    file: { type: objectId, ref: 'File' },
    type:{type:String,enum:['CAREER']},
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('gallery', GallerySchema);