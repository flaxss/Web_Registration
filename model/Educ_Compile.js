const mongoose = require('mongoose');

const educationCompileSchema = new mongoose.Schema({
    list: [{
        service: {
            type: String,
        },
        firstname: {
            type: String,
            uppercase: true
        },
        middlename: {
            type: String,
            uppercase: true
        },
        lastname: {
            type: String,
            uppercase: true
        },
        exname: {
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
        parent_name: {
            mother_name: {
                type: String,
                uppercase: true
            },
            father_name: {
                type: String,
                uppercase: true
            }
        },
        age: {
            type: Number,
        },
        sex: {
            type: String,
            uppercase: true
        },
    }],
    isEmailed: {
        type: Boolean,
        default: false
    }
},{timestamps: true});

const Educ_Compile = mongoose.model('Educ_Compile', educationCompileSchema)
module.exports = Educ_Compile;