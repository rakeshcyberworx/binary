'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;



const serviceShcema = new mongoose.Schema({ 
    
    name: { type: String, required: true },
    file: { type: objectId, ref: 'File' },
    customerId: { type: objectId, ref: 'customer_experience' },
    thumbnail: { type: objectId, ref: 'File' },
    featureImage: { type: objectId, ref: 'File' },
    sortOrder: {type: Number, require:false,default:0},
    
    description: { type: String, required: false,default:" " },

    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('customer_benafit', serviceShcema);