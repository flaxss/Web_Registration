const mongoose = require('mongoose');
const moment = require('moment')

const aicsRecordSchema = new mongoose.Schema({
    status: {
        type: String,
        default: 'completed'
        // importatant
    },
    reference: {
        type: String,
        default: function(){
            return new Date().getFullYear().toString() + new Date().getTime().toString()
        },
        unique: true,
        // importatant
    },
    service: {
        type: String,
        // importatant
    },
    lastname: {
        type: String,
        uppercase: true
    },
    firstname: {
        type: String,
        uppercase: true
    },
    middlename: {
        type: String,
        uppercase: true
    },
    exname: {
        type: String,
        uppercase: true
    },
    fullname: {
        type: String,
        uppercase: true
        // importatant
    },
    birthdate: {
        type: Date,
    },
    age: {
        type: Number,
    },
    sex: {
        type: String,
        uppercase: true
    },
    contact_number: {
        type: Number,
        // importatant
    },
    email: {
        type: String
        // importatant
    },
    civil_status: {
        type: String,
    },
    beneficiary_relationship: {
        type: String,
    },
    street: {
        type: String,
    },
    brgy: {
        type: String,
    },
    municipal: {
        type: String,
    },
    province: {
        type: String,
    },
    fulladdress: {
        type: String,
    },
    occupation: {
        type: String,
    },
    salary: {
        type: String,
    },
    bene_lastname: {
        type: String,
    },
    bene_firstname: {
        type: String,
    },
    bene_middlename: {
        type: String,
    },
    bene_exname: {
        type: String,
    },
    bene_birthdate: {
        type: String,
    },
    bene_age: {
        type: Number,
    },
    bene_sex: {
        type: String,
    },
    bene_contact_number: {
        type: Number,
    },
    bene_civil_status: {
        type: String,
    },
    bene_street: {
        type: String,
    },
    bene_brgy: {
        type: String,
    },
    bene_municipal: {
        type: String,
    },
    bene_province: {
        type: String,
    },
    bene_full_address: {
        type: String,
    },
    expiredAt: {
        type: Date,
        default: function(){
            const currentDate = new Date();
            // return new Date(currentDate.setMonth(currentDate.getMonth()+6))
            return new Date(currentDate.setSeconds(currentDate.getSeconds()+2))
        }
    },
    amount: {
        type: Number
    }
});

const AICS_Record = mongoose.model('AICS_Record', aicsRecordSchema)
module.exports = AICS_Record;

// async function expired(){
//     const isExpired
// }