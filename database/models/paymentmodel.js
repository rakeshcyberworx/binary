'use strict';

const mongoose                  = require('mongoose');
const objectId                  = mongoose.Schema.Types.ObjectId;

const PaymentSchema = new mongoose.Schema({ 
    orderId: { type: String, required: true },
    loanappid: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: Number, required: true },
    email:{type:String,required:true},
    amount: { type: Number, required: true },
    paymentType: { type: String, required: true },
    status: { type: Number, default: false },
    file: {type : objectId, ref: 'File'},
    transaction: { type: String, default: true },
    razorpay: { type: String, default: false,required:false },
    createdBy: { type: objectId, ref: 'User' },
    updatedBy: { type: objectId, ref: 'User' },
    customFields: { type: Object, default: {} },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('payment', PaymentSchema);