'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const FaqSchema = new mongoose.Schema({ 
    title: { type: String, required: true },
    description: { type: String, required: false },
    active: { type: Boolean, default: false },
    category: { type: objectId, ref: 'faq_category',require:false },
    type:{type:String,required:false,enum:['BUYING','FAQ','LOAN','EMI','MANAGEMENT']},
    file: { type: objectId, ref: 'File' },
    sort_order: { type: Number, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('faq', FaqSchema);