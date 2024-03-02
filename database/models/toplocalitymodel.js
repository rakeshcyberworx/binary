'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const ToplocalitySchema = new mongoose.Schema({ 
    name: { type:String, required:false},
    description: { type:String, required:false},
    sort_order: { type: Number, required: false ,default:0},
    file: { type: objectId, ref: 'File' },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('top_locality', ToplocalitySchema);