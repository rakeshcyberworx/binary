'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const JourneySchema = new mongoose.Schema({ 
    year: { type: String, required: false },
    file: { type: objectId, ref: 'File' },
    name:{type:String,required:false},
    type:{type:String,required:false, enum:['COMPANY','DIRECTOR']},
    team:{type:objectId,required:false, ref:'Team'},
    description: { type: String, required: false},
    active: { type: Boolean, default: false },
    sort_order: { type: Number, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('journey', JourneySchema);