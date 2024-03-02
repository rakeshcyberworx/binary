'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;


const HomeSchema = new mongoose.Schema({
    solutionTitle: { type: String, required: true },
    solutionDescription :{ type: String,required: false, default: "" },
    whyCustomerTitle: { type: String,required: false, default : "" },
    whyCustomerDescription: { type: String,required: false, default: "" },
    youtubeLink: { type: String,required: false, default: "" },
    storieTitle: { type: String,required: false, default: "" },
    storieDescription: { type: String,required: false, default: "" },
    technologyTitle: { type: String,required: false, default: "" },   
    technologyDescription: { type: String,required: false, default: "" },
    file: { type: objectId,required: false, ref: "File" },
    blog: { type: objectId,required: false, ref: "File" },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('home', HomeSchema);