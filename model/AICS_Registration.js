const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')
const aicsRegistrationSchema = new mongoose.Schema({
    status: {
        type: String,
        default: 'pending'
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
        uppercase: true,
        default: function(){
            return `${this.firstname} ${this.middlename} ${this.lastname} ${this.exname}`
        }
    },
    birthdate: {
        // type: Date,
        type: String,
    },
    age: {
        type: Number,
        default: function(){
            const birthdate = new Date(this.birthdate);
            const differenceMs = Date.now() - birthdate.getTime();
            const age = Math.floor(differenceMs / (1000 * 60 * 60 * 24 * 365));
            return age
        }
    },
    sex: {
        type: String,
        uppercase: true
    },
    contact_number: {
        type: Number,
    },
    email: {
        type: String,
        default: 'N/A'
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
        uppercase: true
    },
    bene_firstname: {
        type: String,
        uppercase: true
    },
    bene_middlename: {
        type: String,
        uppercase: true
    },
    bene_exname: {
        type: String,
        uppercase: true
    },
    bene_fullname: {
        type: String,
        default: function(){
            return `${this.bene_firstname} ${this.bene_middlename} ${this.bene_lastname} ${this.bene_exname}`
        }
    },
    bene_birthdate: {
        type: String,
    },
    bene_age: {
        type: Number,
        default: function(){
            const birthdate = new Date(this.bene_birthdate);
            const differenceMs = Date.now() - birthdate.getTime();
            const age = Math.floor(differenceMs / (1000 * 60 * 60 * 24 * 365));
            return age
        }
    },
    bene_sex: {
        type: String,
        uppercase: true
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
    family_name: {
        type: [String]
    },
    family_age: {
        type: [Number]
    },
    family_occupation: {
        type: [String]
    },
    family_salary: {
        type: [Number]
    },
    isArchive: {
        type: Boolean,
        default: false
    }
});

aicsRegistrationSchema.plugin(mongoosePaginate)

const AICS_Registration = mongoose.model('AICS_Registration', aicsRegistrationSchema)
module.exports = AICS_Registration;

async function find(){
    const search = await AICS_Registration.findOne({
        bene_firstname: 'ALEX',
        bene_middlename: 'NOQUILLO',
        bene_lastname: 'WALIDJE',
        bene_exname: 'sr'
    })
    if(search){
        console.log(search.bene_fullname)
    }else{
        console.log('not found')
    }
}
// find()