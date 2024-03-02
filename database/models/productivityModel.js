'use strict';

const { string } = require('joi');
const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;



const ProductivitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    shortDescription: { type: String, required: false },
    description: { type: String,required: false, default: "" },
    file: { type: objectId, ref: 'File' },
    sortOrder: { type: Number,required: false },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('productivity', ProductivitySchema);