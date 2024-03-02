'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const HomePartnerSchema = new mongoose.Schema({ 
    name: { type:String, required:false},
    slug: { type:String, required:false},
    type:{type:String,required:false,enum:['PARTNER','EXPERIENCE']},
    tag:[{type:objectId,ref:'partnerTag',required:false}],
    feature:{type:Number,required:false,default:0},
    description: { type:String, required:false},
    link: { type:String, required:false},
    sortOrder: { type: Number, required: false },
    file: { type: objectId, ref: 'File' },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('partner', HomePartnerSchema);