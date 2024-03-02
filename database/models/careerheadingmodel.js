'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const headingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    file: { type: objectId, ref: 'File' },
    description: { type: String,required: false, default: "" },
    benafitTitle: { type: String,required: false, default: "" },
    benafitDescription: { type: String,required: false, default: "" },
    positionTitle: { type: String,required: false, default: "" },
    positionDescription: { type: String,required: false, default: "" },
    termLine: { type: String,required: false, default: "" },
    termDescription: { type: String,required: false, default: "" },
    teamTitle: { type: String,required: false, default: "" },
    teamDescription: { type: String,required: false, default: "" },
    cultureTitle: { type: String,required: false, default: "" },
    cultureDescription: { type: String,required: false, default: "" },
    speakTitle: { type: String,required: false, default: "" },
    speakDescription: { type: String,required: false, default: "" },
    joinTitle: { type: String,required: false, default: "" }, 
    joinDescription: { type: String,required: false, default: "" },
    doNext: [{ type: String,required: false, default: "" }],
    email: { type: String,required: false, default: "" },
    active: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('career_heading', headingSchema);