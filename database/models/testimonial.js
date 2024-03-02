'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const TestimonialSchema = new mongoose.Schema({ 
    name: { type: String, required: false },
    youtube: { type: String, required: false },
    page: { type: String, required: false },
    designation: { type: String, required: false },
    type:{type:String,required:false ,enum:['TESTIMONIAL','EXPERIENCE','CAREER']},
    file: { type: objectId, ref: 'File' },
    description: { type: String, required: false},
    feature: { type: Number, required: false,default:0},
    active: { type: Boolean, default: false },
    sortOrder: { type: Number, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('testimonial', TestimonialSchema);