'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const SpecificationsSchema = new mongoose.Schema({
    _id: false,
    listId: { type: String, required: false, default: '' },
    sortOrder: { type: Number, required: false, default: '' },
    type: { type: String, required: false, default: '' },
}, { timestamps: false, versionKey: false });


const serviceShcema = new mongoose.Schema({ 
    name:{type:String,required:true},
    shortDescription:{type:String,required:false},
    sortOrder:{type:Number,required:false},
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },     
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('solutionHome', serviceShcema);