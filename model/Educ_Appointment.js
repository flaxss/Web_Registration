const mongoose = require('mongoose');

const educationAppointmentSchema = new mongoose.Schema({
    status: {
        type: String,
        default: 'appointment'
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
        type: String
    },
    spouse_fname: {
        type: String
    },
    spouse_mname: {
        type: String
    },
    spouse_exname: {
        type: String
    },
    spouse_occupation: {
        type: String
    },

    mother_lname: {
        type: String
    },
    mother_fname: {
        type: String
    },
    mother_mname: {
        type: String
    },
    mother_occupation: {
        type: String
    },
    
    father_lname: {
        type: String
    },
    father_fname: {
        type: String
    },
    father_mname: {
        type: String
    },
    father_exname: {
        type: String
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

// module.exports = mongoose.model('Appointment', appointmentSchema)

const Educ_Appointment = mongoose.model('Educ_Appointment', educationAppointmentSchema)
module.exports = Educ_Appointment;