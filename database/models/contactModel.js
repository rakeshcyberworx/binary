'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const AddesseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    designation: { type: String, required: false },
    description: { type: String, required: false, default: '' },
    sort_order: { type: Number, default: 0 },
    file: { type: objectId, ref:'File', required:false },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('contact', AddesseSchema);