'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const StateSchema = new mongoose.Schema({ 
    name: { type: String, required: true },
    files: { type: objectId, ref: 'File' },
    sort_order:{type: Number, default: false},
    status: { type: Number, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('states', StateSchema);