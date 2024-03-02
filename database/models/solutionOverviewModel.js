'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

// Note: this is a solution service overview


const serviceShcema = new mongoose.Schema({ 

    
    solutionServiceId: { type: objectId, required: true,ref:"solutionService" },
    name: { type: String, required: true },
    file: { type: objectId, ref: 'File' },
    sortOrder: {type: Number, require:false,default:0},
    description: { type: String, required: false,default:" " },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('solutionOverview', serviceShcema);