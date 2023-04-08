const mongoose = require('mongoose');

const educationConfirmSchema = new mongoose.Schema({
    status: {
        type: String,
        default: 'to confirm'
    },
    reference: {
        type: String,
        default: function(){
            return new Date().getFullYear().toString() + new Date().getTime().toString()
        },
        unique: true,
    },
    service: {
        type: String,
        required: true,
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
        default: function(){
            return `${this.firstname} ${this.middlename} ${this.lastname} ${this.exname}`
        },
        unique: true,
        uppercase: true
    },
    email: {
        type: String,
    },
    appointment_date: {
        type: Date,
    },
    event_date: {
        type: String,
    },
    r_street: {
        type: String
    },
    r_brgy: {
        type: String
    },
    r_municipal: {
        type: String
    },
    r_province: {
        type: String
    },
    r_full_address: {
        type: String,
        default: function(){
            return `${this.r_street}, ${this.r_brgy}, ${this.r_municipal}, ${this.r_province}`
        }
    },
    p_street: {
        type: String
    },
    p_brgy: {
        type: String
    },
    p_municipal: {
        type: String
    },
    p_province: {
        type: String
    },
    p_full_address: {
        type: String,
        default: function(){
            return `${this.p_street}, ${this.p_brgy}, ${this.p_municipal}, ${this.p_province}`
        }
    },
    date_of_birth: {
        // type: Date,
        type: String,
    },
    place_of_birth: {
        type: String
    },
    citizenship: {
        type: String
    },
    age: {
        type: Number,
    },
    sex: {
        type: String,
        uppercase: true
    },
    civil_status: {
        type: String
    },
    contact_number: {
        type: Number
    },
    spouse_lname: {
        type: String,
        uppercase: true
    },
    spouse_fname: {
        type: String,
        uppercase: true
    },
    spouse_mname: {
        type: String,
        uppercase: true
    },
    spouse_exname: {
        type: String,
        uppercase: true
    },
    spouse_occupation: {
        type: String
    },

    mother_lname: {
        type: String,
        uppercase: true
    },
    mother_fname: {
        type: String,
        uppercase: true
    },
    mother_mname: {
        type: String,
        uppercase: true
    },
    mother_occupation: {
        type: String
    },
    
    father_lname: {
        type: String,
        uppercase: true
    },
    father_fname: {
        type: String,
        uppercase: true
    },
    father_mname: {
        type: String,
        uppercase: true
    },
    father_exname: {
        type: String,
        uppercase: true
    },
    father_occupation: {
        type: String
    },
    elementary: {
        name_of_school: {
            type: String,
            default: 'NA',
        },
        school_year: {
            type: String,
            default: 'NA',
        }
    },
    secondary: {
        name_of_school: {
            type: String,
            default: 'NA',
        },
        school_year: {
            type: String,
            default: 'NA',
        }
    },
    vocational: {
        name_of_school: {
            type: String,
            default: 'NA',
        },
        school_year: {
            type: String,
            default: 'NA',
        }
    },
    college: {
        name_of_school: {
            type: String,
            default: 'NA',
        },
        school_year: {
            type: String,
            default: 'NA',
        }
    },
    course: {
        type: String
    },
    year_level: {
        type: String
    },
    sem: {
        type: String
    },
    char_ref_name: {
        type: [String]
    },
    char_ref_add: {
        type: [String]
    },
    char_ref_num: {
        type: [String]
    }
});

const Educ_Confirm = mongoose.model('Educ_Confirm', educationConfirmSchema)
module.exports = Educ_Confirm;