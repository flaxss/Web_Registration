const mongoose = require('mongoose');

const aicsCompileSchema = new mongoose.Schema({
    service: {
        type: String,
    },
    client_name: {
        type: String,
        uppercase: true
    },
    beneficiary_name: {
        type: String,
        uppercase: true
    },
    sex: {
        type: String,
        uppercase: true
    },
    address: {
        type: String
    },
    contact_number: {
        type: String
    },
    email: {
        type: String,
    },
    amount: {
        type: Number
    }
},{timestamps: true});

const AICS_Compile = mongoose.model('AICS_Compile', aicsCompileSchema)
module.exports = AICS_Compile;