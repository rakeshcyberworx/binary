'use strict';

const mongoose                  = require('mongoose');
const uniqueValidator           = require('mongoose-unique-validator');
const bcrypt                    = require('bcrypt');
const objectId                  = mongoose.Schema.Types.ObjectId;

const LocationSchema = new mongoose.Schema({
    _id: false,
    address: { type: String, required: false, default: "" },
    street: { type: String, required: false, default: "" },
    landmark: { type: String, required: false, default: "" },
    state: { type: String, required: false, default: "" },
    city: { type: String, required: false, default: "" },
    pinCode: { type: String, required: false, default: "" },
    geoLocation: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

const OverallReview = new mongoose.Schema({
    _id: false,
    review: [{ type: objectId, ref: 'Review' }],
    avgRating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    excellent: { type: Number, default: 0 },
    veryGood: { type: Number, default: 0 },
    good: { type: Number, default: 0 },
    average: { type: Number, default: 0 },
    poor: { type: Number, default: 0 },
    none: { type: Number, default: 0 }
}, { timestamps: true, versionKey: false });

const DevicesSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ["ANDROID", "IOS", "WEB"] },
    deviceId: { type: String, required: true },
    uuid: { type: String, required: true }
}, { timestamps: true, versionKey: false });

const BankSchema = new mongoose.Schema({
    _id : false,
    name: { type: String, required: false, default: "" },
    address: { type: String, required: false, default: "" },
    accountNumber: { type: String, required: false, default: "" },
    ifscCode: { type: String, required: false, default: "" },
}, { timestamps: true, versionKey: false });

const UserSchema = new mongoose.Schema({
    email: { type: String, required: false },
    phoneNumber: { type: Number, required: false },
    userName: { type: String, required: false },
    password: { type: String, required: false },
    role: { type: objectId, ref: 'Role',required: false  },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    file: { type: objectId, ref: 'File' },
    coverPhoto: { type: objectId, ref: 'File' },
    registerDevices: [DevicesSchema],
    active: { type: Boolean, default: true },
    firstLogin: { type: Boolean, default: true },
    online: { type: Boolean, default: false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} }
}, { timestamps: true, versionKey: false });

UserSchema.plugin(uniqueValidator, { message: "Duplicate Entry {PATH}" });

UserSchema.pre('save', async function (next) {
    if (this.password) {
        const salt = await bcrypt.genSalt(parseInt(process.env.HASH_COST));
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

UserSchema.methods.isValidPassword = async function (password) {
    const doc = await this.model('User').findOne({ _id: this._id }, 'password');
    return await bcrypt.compare(password, doc.password);
};

module.exports = mongoose.model('User', UserSchema);