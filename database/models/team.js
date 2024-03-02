'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const TeamSchema = new mongoose.Schema({ 
    name: { type: String, required: true },
    designation: { type: String, required: false },
    file: { type: objectId, ref: 'File' },
    banner: { type: objectId, ref: 'File' },
    description: { type: String, required: false},
    fulldescription: { type: String, required: false},
    link: { type: String, required: false},
    linkedin: { type: String, required: false},
    active: { type: Boolean, default: false },
    sort_order: { type: Number, default: false },
    type: { type: String, default: false,enum:['KEY','TEAM'] },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Team', TeamSchema);