const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    status: {
        type: String,
        default: 'appointment'
    },
    reference: {
        type: String,
    },
    service: {
        type: String,
    },
    lastname: {
        type: String
    },
    firstname: {
        type: String
    },
    middlename: {
        type: String
    },
    exname: {
        type: String
    },
    fullname: {
        type: String,
    },
    email: {
        type: String,
    },
    contact_number: {
        type: Number
    },
    appointment_date: {
        type: Date,
    },
    r_full_address: {
        type: String,
    },
    p_full_address: {
        type: String,
    },
    date_of_birth: {
        type: Date,
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
        type: String
    },
    civil_status: {
        type: String
    },
},{timestamps});

// module.exports = mongoose.model('Appointment', appointmentSchema)

const Appointment = mongoose.model('Appointment', appointmentSchema)
module.exports = Appointment;