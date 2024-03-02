'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const BlogSchema = new mongoose.Schema({
  
    name: { type: String, required: true },
    description: { type: String,required: false, default: "" },
    sortOrder: { type: Number,required: false, default: "" },
    file: { type: objectId, ref: 'File' },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('accreditation', BlogSchema);