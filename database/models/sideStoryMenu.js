'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const SidemenuSchema = new mongoose.Schema({ 
    name: { type: String, required: true },
    link: { type: String, required: true },
    files: { type: objectId, ref: 'File' },
    sortOrder:{type: Number, default: false},
    active: { type: Boolean, default: false },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('sidemenu', SidemenuSchema);