'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const benafitSchema = new mongoose.Schema({
    name: { type: String, required: true },
    file: { type: objectId, ref: 'File' },
    description: { type: String,required: false, default: "" },
    sortOrder: { type: Number, default: false },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('careerbenafit', benafitSchema);