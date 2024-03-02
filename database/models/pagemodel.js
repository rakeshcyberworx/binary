'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const PageSchema = new mongoose.Schema({ 

    title: { type: String, required: true },
    sort_des: { type: String, required: false },
    description: { type: String, required: false },
    meta_title:{type:String,required:true},
    meta_description: { type: String, required: true },
    meta_keyword: { type: String, required: true },
    sort_order: { type: Number, required: false },
    keyword: { type: String, required: true },
    status: { type: Number, default: false },
    file: {type : objectId, ref: 'File'},
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('page', PageSchema);