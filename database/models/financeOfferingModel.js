'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;


const SpecificationsSchema = new mongoose.Schema({
    _id: false,
    name: { type: String, required: false, default: '' },
    value: { type: String, required: false, default: '' },
}, { timestamps: false, versionKey: false });


const serviceShcema = new mongoose.Schema({ 

    
    financeId: { type: objectId, required: true,ref:"finance" },
    name: { type: String, required: true },
    file: { type: objectId, ref: 'File' },

    sortOrder: {type: Number, require:false,default:0},

    shortDescription: { type: String, required: false,default:" " },
    description: { type: String, required: false,default:" " },
   
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('financeOffering', serviceShcema);