const moment = require('moment')
const AICS_Record = require('../model/AICS_Record')
const AICS_Registration = require('../model/AICS_Registration')
const AICS_Confirmation = require('../model/AICS_Confirmation')
const Educ_Appointment = require('../model/Educ_Appointment')
const Educ_Confirmation = require('../model/Educ_Confirmation')
const Announcement = require('../model/Announcement')
const Event = require('../model/Event')

const dotenv = require('dotenv');
dotenv.config({path: 'config.env'});

const fs = require('fs');

const Mailgen = require('mailgen')
const nodemailer = require('nodemailer')
const { json } = require('express')
const Educ_Registration = require('../model/Educ_Registration')

// generate email and password to connect with node mailer
let config = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
}
// user and generate a template for the email
let transporter = nodemailer.createTransport(config)
let MailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'CSWD OFFICE',
        link: 'https://mailgen.js'
    }
})

// parse date
function dateFormat(date){
    let day = moment(date).format('DD')
    let month = moment(date).format('MM')
    let year = moment(date).format('YYYY')
    let formatted = `${year}-${month}-${day}`
    return formatted;
}

// format date in a using full month
function format(list){
    let events = [];
    if(list){
        list.forEach(data => {
            events.push({
                event_date: moment(data.event_date).format('MMMM DD YYYY'),
                quota: data.quota
            })
        })
    }
    return events;
}

let http_localhost = 'http://localhost:3000'

module.exports.home = async(req, res) => {
    const renderPost = await Announcement.find({})
    let formatted = []
    renderPost.forEach(data => {
        // parse date into readable
        formatted.push({
            year: moment(data.createdAt).format('YYYY'),
            month: moment(data.createdAt).format('MMMM'),
            day: moment(data.createdAt).format('DD')
        })
    })
    res.render('user/home', {renderPost, formatted})
}

module.exports.college_assistance = (req, res) => {
    res.render('user/educ/college')
}

module.exports.college_assistance_form_get = async(req, res) => {
    const list = await Event.find().sort({nonFormat: 1})
    // let events = format(list)
    let events = list
    res.render('user/educ/form/college_form', {events})
}

module.exports.college_assistance_form_post = async(req, res) => {
    const {
        lastname,
        firstname,
        middlename,
        exname,
        email,
        // appointment_date,
        event_date,
        r_street,
        r_brgy,
        r_municipal,
        r_province,
        p_street,
        p_brgy,
        p_municipal,
        p_province,
        date_of_birth,
        place_of_birth,
        citizenship,
        age,
        sex,
        civil_status,
        contact_number,
        spouse_lname,
        spouse_fname,
        spouse_mname,
        spouse_exname,
        spouse_occupation,
        mother_lname,
        mother_fname,
        mother_mname,
        mother_occupation,
        father_lname,
        father_fname,
        father_mname,
        father_exname,
        father_occupation,
        e_name_of_school,
        e_school_year,
        s_name_of_school,
        s_school_year,
        v_name_of_school,
        v_school_year,
        c_name_of_school,
        c_school_year,
        course,
        year_level,
        sem,
        char_ref_name,
        char_ref_add,
        char_ref_num
    } = req.body;
    const isConfirmed = await Educ_Confirmation.findOne({
        firstname: req.body.firstname.toUpperCase(), middlename: req.body.middlename.toUpperCase(), lastname: req.body.lastname.toUpperCase(), exname: req.body.exname.toUpperCase()
    })
    const isAppointed = await Educ_Appointment.findOne({
        firstname: req.body.firstname.toUpperCase(), middlename: req.body.middlename.toUpperCase(), lastname: req.body.lastname.toUpperCase(), exname: req.body.exname.toUpperCase()
    })
    const isRegistered = await Educ_Registration.findOne({
        firstname: req.body.firstname.toUpperCase(), middlename: req.body.middlename.toUpperCase(), lastname: req.body.lastname.toUpperCase(), exname: req.body.exname.toUpperCase()
    })
    if(isConfirmed){
        console.log(`already registered in ${isConfirmed.service}`)
        res.send('already registered')
        // res.redirect('/college-assistance')
    }else if(isAppointed){
        console.log(`already registered in ${isAppointed.service}`)
        res.send('already registered')
        // res.redirect('/college-assistance')
    }else if(isRegistered){
        console.log(`already registered in ${isRegistered.service}`)
        res.send('already registered')
        // res.redirect('/college-assistance')
    }else{
        const slot = await Event.findOne({event_date: req.body.event_date})
        if(!slot){
            return res.send("<p>We're sorry, but the remaining slot is already occupied. Please try again later.</p>")
        }
        const create = await Educ_Confirmation({
            service: 'College Educational Assistance',
            lastname,
            firstname,
            middlename,
            exname,
            email,
            // appointment_date,
            event_date,
            r_street,
            r_brgy,
            r_municipal,
            r_province,
            r_full_address: `${r_street}, ${r_brgy}, ${r_municipal}, ${r_province}`,
            p_street,
            p_brgy,
            p_municipal,
            p_province,
            p_full_address: `${p_street}, ${p_brgy}, ${p_municipal}, ${p_province}`,
            date_of_birth,
            place_of_birth,
            citizenship,
            age,
            sex,
            civil_status,
            contact_number: contact_number,
            spouse_lname,
            spouse_fname,
            spouse_mname,
            spouse_exname,
            spouse_occupation,
            mother_lname,
            mother_fname,
            mother_mname,
            mother_occupation,
            father_lname,
            father_fname,
            father_mname,
            father_exname,
            father_occupation,
            elementary: {
                name_of_school: e_name_of_school,
                school_year: e_school_year,
            },
            secondary: {
                name_of_school: s_name_of_school,
                school_year: s_school_year
            },
            vocational: {
                name_of_school: v_name_of_school,
                school_year: v_school_year
            },
            college: {
                name_of_school: c_name_of_school,
                school_year: c_school_year
            },
            course,
            year_level,
            sem,
            char_ref_name,
            char_ref_add,
            char_ref_num,
        })
        create.save()
        .then(async() => {
            console.log(`${create} is created`)
            await Event.findOneAndUpdate({event_date: create.event_date}, {$inc: {quota: -1}})
            const event = await Event.find().populate('quota')
            event.forEach(async(data) => {
                if(data.quota <= 0){
                    await Event.findByIdAndDelete(data.id)
                }
            })
            let response = {
                body: {
                    name: `${req.body.firstname} ${req.body.middlename} ${req.body.lastname}`,
                    intro: `Congrats! You are successfully registered ${create.reference}`,
                    action: {
                        instruction: `If your information is incorrect, you may edit your response here: `,
                        button: {
                            color: '#22BC66', // Optional action button color
                            text: 'CONFIRM',
                            link: `${http_localhost}/college-assistance/${create.id}/confirm`
                        },
                    },
                }
            }
            let mail = MailGenerator.generate(response)
            let message = {
                from: 'support@email.com',
                to: req.body.email,
                subject: 'social service',
                html: mail
            }
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            // res.redirect(`/college-assistance/${create.id}/preview`)
            res.send('you are successfully registered! please check your email to confirm your registration.')
        })
        .catch(err => {
            console.log(err.message)
            res.status(404).render('err/notfound')
        })
    }
}

module.exports.college_assistance_confirm = async(req, res) => {
    const id = req.params.id
    try {
        const confirm = await Educ_Confirmation.findByIdAndDelete(id)
        console.log(confirm)
        const create = await Educ_Appointment({
            service: confirm.service,
            reference: confirm.reference,
            lastname: confirm.lastname,
            firstname: confirm.firstname,
            middlename: confirm.middlename,
            exname: confirm.exname,
            email: confirm.email,
            // appointment_date: confirm.appointment_date,
            event_date: confirm.event_date,
            r_street: confirm.r_street,
            r_brgy: confirm.r_brgy,
            r_municipal: confirm.r_municipal,
            r_province: confirm.r_province,
            p_street: confirm.p_street,
            p_brgy: confirm.p_brgy,
            p_municipal: confirm.p_municipal,
            p_province: confirm.p_province,
            date_of_birth: confirm.date_of_birth,
            place_of_birth: confirm.place_of_birth,
            citizenship: confirm.citizenship,
            age: confirm.age,
            sex: confirm.sex,
            civil_status: confirm.civil_status,
            contact_number : confirm.contact_number,
            spouse_lname: confirm.spouse_lname,
            spouse_fname: confirm.spouse_fname,
            spouse_mname: confirm.spouse_mname,
            spouse_exname: confirm.spouse_exname,
            spouse_occupation: confirm.spouse_occupation,
            mother_lname: confirm.mother_lname,
            mother_fname: confirm.mother_fname,
            mother_mname: confirm.mother_mname,
            mother_occupation: confirm.mother_occupation,
            father_lname: confirm.father_lname,
            father_fname: confirm.father_fname,
            father_mname: confirm.father_mname,
            father_exname: confirm.father_exname,
            father_occupation: confirm.father_occupation,
            elementary: {
                name_of_school: confirm.elementary.name_of_school,
                school_year: confirm.elementary.school_year,
            },
            secondary: {
                name_of_school: confirm.secondary.name_of_school,
                school_year: confirm.secondary.school_year,
            },
            vocational: {
                name_of_school: confirm.vocational.name_of_school,
                school_year: confirm.vocational.school_year,
            },
            college: {
                name_of_school: confirm.college.name_of_school,
                school_year: confirm.college.school_year,
            },
            course: confirm.course,
            year_level: confirm.year_level,
            sem: confirm.sem,
            char_ref_name: confirm.char_ref_name,
            char_ref_add: confirm.char_ref_add,
            char_ref_num: confirm.char_ref_num,
        })
        create.save()
        .then(async() => {
            console.log(`${create} is created`)
            let response = {
                body: {
                    name: `${create.firstname} ${create.middlename} ${create.lastname}`,
                    intro: `Congrats! You are successfully registered here is your reference number: ${create.reference}
                    Please click the link
                    <a href="${http_localhost}/college-assistance/${create.id}/preview">here</a>
                    to download the form`,
                    action: {
                        instruction: `If your information is incorrect, you may edit your response here: `,
                        button: {
                            color: '#22BC66',
                            text: 'update response',
                            link: `${http_localhost}/college-assistance/${create.id}/update-response`
                        },
                    },
                }
            }
            let mail = MailGenerator.generate(response)
            let message = {
                from: 'support@email.com',
                to: create.email,
                subject: 'social service',
                html: mail
            }
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            res.redirect(`/college-assistance/${create.id}/preview`)
        })
        .catch(err => {
            console.log(err.message)
            res.status(404).render('err/notfound')
        })
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}

module.exports.college_assistance_preview = async(req, res) => {
    const id = req.params.id;
    try {
        const find = await Educ_Appointment.findById(id);
        if(find){
            let date_of_birth = moment(find.date_of_birth).format('MMMM DD, YYYY')
            res.render('user/educ/form/college_preview', {find, date_of_birth})
        }else{
            res.status(404).render('err/notfound')
        }
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}

module.exports.college_assistance_update_get = async(req, res) => {
    const id = req.params.id
    try {
        const appointment = await Educ_Appointment.findById(id)
        let formatted = dateFormat(appointment.appointment_date)
        console.log(appointment)
        const list = await Event.find().sort({nonFormat: 1})
        let events = format(list)
        res.render('user/educ/form/update_form/college_form', {events, appointment, formatted})
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}
module.exports.college_assistance_update_post = async(req, res) => {
    const id = req.params.id
    console.log(req.body)
    try {
        const appoitnemnt = await Educ_Appointment.findByIdAndDelete(id)
        const create = await Educ_Appointment({
            service: req.body.service,
            reference: req.body.reference,
            lastname: req.body.lastname,
            firstname: req.body.firstname,
            middlename: req.body.middlename,
            exname: req.body.exname,
            email: req.body.email,
            // appointment_date: appoitnemnt.appointment_date,
            r_street: req.body.r_street,
            r_brgy: req.body.r_brgy,
            r_municipal: req.body.r_municipal,
            r_province: req.body.r_province,
            p_street: req.body.p_street,
            p_brgy: req.body.p_brgy,
            p_municipal: req.body.p_municipal,
            p_province: req.body.p_province,
            date_of_birth: req.body.date_of_birth,
            place_of_birth: req.body.place_of_birth,
            citizenship: req.body.citizenship,
            age: req.body.age,
            sex: req.body.sex,
            civil_status: req.body.civil_status,
            contact_number : req.body.contact_number,
            spouse_lname: req.body.spouse_lname,
            spouse_fname: req.body.spouse_fname,
            spouse_mname: req.body.spouse_mname,
            spouse_exname: req.body.spouse_exname,
            spouse_occupation: req.body.spouse_occupation,
            mother_lname: req.body.mother_lname,
            mother_fname: req.body.mother_fname,
            mother_mname: req.body.mother_mname,
            mother_occupation: req.body.mother_occupation,
            father_lname: req.body.father_lname,
            father_fname: req.body.father_fname,
            father_mname: req.body.father_mname,
            father_exname: req.body.father_exname,
            father_occupation: req.body.father_occupation,
            elementary: {
                name_of_school: req.body.e_name_of_school,
                school_year: req.body.e_school_year,
            },
            secondary: {
                name_of_school: req.body.s_name_of_school,
                school_year: req.body.s_school_year
            },
            vocational: {
                name_of_school: req.body.v_name_of_school,
                school_year: req.body.v_school_year
            },
            college: {
                name_of_school: req.body.c_name_of_school,
                school_year: req.body.c_school_year
            },
            course: req.body.course,
            year_level: req.body.year_level,
            sem: req.body.sem,
            char_ref_name: req.body.char_ref_name,
            char_ref_add: req.body.char_ref_add,
            char_ref_num: req.body.char_ref_num,
        })
        create.save()
        .then(() => {
            console.log(`${create} is created`)
            res.redirect(`/college-assistance/${create.id}/preview`)
        })
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}

module.exports.medical_assistance = (req, res) => {
    res.render('user/aics/medical')
}
module.exports.medical_assistance_form_get = (req, res) => {
    res.render('user/aics/form/medical_form')
}
module.exports.medical_assistance_form_post = async(req, res) => {
    const body = req.body;
    let isConfirmed = await AICS_Confirmation.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(), bene_middlename: req.body.bene_middlename.toUpperCase(), bene_lastname: req.body.bene_lastname.toUpperCase(), bene_exname: req.body.bene_exname.toUpperCase()
    })
    let isRegistered = await AICS_Registration.findOne({bene_firstname: req.body.bene_firstname.toUpperCase(), bene_middlename: req.body.bene_middlename.toUpperCase(), bene_lastname: req.body.bene_lastname.toUpperCase(), bene_exname: req.body.bene_exname.toUpperCase()
    })
    if(isConfirmed){
        console.log(`is already registered in ${isConfirmed.service}`)
        res.redirect('/medical-assistance')
    }else if(isRegistered){
        console.log(`is already registered in ${isRegistered.service}`)
        res.redirect('/medical-assistance')
    }else{
        const create = await AICS_Confirmation(body)
        create.save()
        .then(async() => {
            console.log(`${create} is registered`)
            let response = {
                body: {
                    name: `${req.body.firstname} ${req.body.middlename} ${req.body.lastname}`,
                    intro: `Please confirm your registration by clicking the confirm button`,
                    action: {
                        instruction: 'Please confirm your registration by clicking the confirm button',
                        button: {
                            color: '#22BC66',
                            text: 'CONFIRM',
                            link: `${http_localhost}/medical-assistance/${create.id}/confirm`
                        },
                    },
                }
            }
            let mail = MailGenerator.generate(response)
            let message = {
                from: 'support@email.com',
                to: req.body.email,
                subject: 'social service',
                html: mail
            }
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            // res.redirect(`/medical-assistance/${create.id}/preview`)
            res.send('you are successfully registered! please check your email to confirm your registration.')
        })
        .catch(err => {
            console.log(err.message)
            res.status(404).render('err/notfound')
        })
    }
}

module.exports.medical_assistance_confirm = async(req, res) => {
    const id = req.params.id
    try {
        const confirm = await AICS_Confirmation.findByIdAndDelete(id)
        console.log(confirm)
        const create = await AICS_Registration({
            service: confirm.service,
            lastname: confirm.lastname,
            firstname: confirm.firstname,
            middlename: confirm.middlename,
            exname: confirm.exname,
            birthdate: confirm.birthdate,
            age: confirm.age,
            sex: confirm.sex,
            contact_number: confirm.contact_number,
            email: confirm.email,
            civil_status: confirm.civil_status,
            beneficiary_relationship: confirm.beneficiary_relationship,
            street: confirm.street,
            brgy: confirm.brgy,
            municipal: confirm.municipal,
            province: confirm.province,
            occupation: confirm.occupation,
            salary: confirm.salary,
            bene_lastname: confirm.bene_lastname,
            bene_firstname: confirm.bene_firstname,
            bene_middlename: confirm.bene_middlename,
            bene_exname: confirm.bene_exname,
            bene_birthdate: confirm.bene_birthdate,
            bene_age: confirm.bene_age,
            bene_sex: confirm.bene_sex,
            bene_contact_number: confirm.bene_contact_number,
            bene_civil_status: confirm.bene_civil_status,
            bene_street: confirm.bene_street,
            bene_brgy: confirm.bene_brgy,
            bene_municipal: confirm.bene_municipal,
            bene_province: confirm.bene_province,
            family_name: confirm.family_name,
            family_age: confirm.family_age,
            family_occupation: confirm.family_occupation,
            family_salary: confirm.family_salary,
        })
        create.save()
        .then(async() => {
            console.log(`${create} is created and confirmed`)
            let response = {
                body: {
                    name: `${create.firstname} ${create.middlename} ${create.lastname}`,
                    intro: `Congrats! You are successfully registered here is your reference number: ${create.reference}
                    Please click the link
                    <a href="${http_localhost}/medical-assistance/${create.id}/preview">here</a>
                    to download the form`,
                    action: {
                        instruction: `If your information is incorrect, you may edit your response here: `,
                        button: {
                            color: '#22BC66',
                            text: 'update response',
                            link: `${http_localhost}/medical-assistance/${create.id}/update-response`
                        },
                    },
                }
            }
            let mail = MailGenerator.generate(response)
            let message = {
                from: 'support@email.com',
                to: create.email,
                subject: 'social service',
                html: mail
            }
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            // res.send('confirmed')
            res.redirect(`/medical-assistance/${create.id}/preview`)
        })
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}
// preview the submitted form
module.exports.medical_assistance_preview = async(req, res) => {
    const id = req.params.id
    try {
        const find = await AICS_Registration.findById(id)
        console.log(find)
        if(find){
            return res.render('user/aics/aics_preview', {find})
            // return res.send('successfully registered')
        }
        res.status(404).render('err/notfound')
    }catch(err){
        res.status(404).render('err/notfound')
    }
}

// get the old data then update
module.exports.medical_assistance_update_get = async(req, res) => {
    const id = req.params.id
    try {
        const find = await AICS_Registration.findById(id)
        if(find){
            let formatted = dateFormat(find.birthdate)
            let bene_formatted = dateFormat(find.bene_birthdate)
            return res.render('user/aics/form/update_form/med_update_form', {find, formatted, bene_formatted})
        }else{
            return res.status(404).render('err/notfound')
        }
    }catch(err){
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}
module.exports.medical_assistance_update_post = async(req, res) => {
    const id = req.params.id
    const body = req.body
    await AICS_Registration.findByIdAndDelete(id)
    const create = await AICS_Registration(body)
    create.save()
    .then(() => {
        res.redirect(`/medical-assistance/${create.id}/preview`)
    })
}

module.exports.burial_assistance = (req, res) => {
    res.render('user/aics/burial')
}
module.exports.burial_assistance_form_get = (req, res) => {
    res.render('user/aics/form/burial_form')
}
module.exports.burial_assistance_form_post = async(req, res) => {
    const body = req.body;
    let isConfirmed = await AICS_Confirmation.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(), bene_middlename: req.body.bene_middlename.toUpperCase(), bene_lastname: req.body.bene_lastname.toUpperCase(), bene_exname: req.body.bene_exname.toUpperCase()
    })
    let isRegistered = await AICS_Registration.findOne({bene_firstname: req.body.bene_firstname.toUpperCase(), bene_middlename: req.body.bene_middlename.toUpperCase(), bene_lastname: req.body.bene_lastname.toUpperCase(), bene_exname: req.body.bene_exname.toUpperCase()
    })
    if(isConfirmed){
        console.log(`is already registered in ${isConfirmed.service}`)
        res.redirect('/burial-assistance')
    }else if(isRegistered){
        console.log(`is already registered in ${isRegistered.service}`)
        res.redirect('/burial-assistance')
    }else{
        const create = await AICS_Confirmation(body)
        create.save()
        .then(async() => {
            console.log(`${create} is registered`)
            let response = {
                body: {
                    name: `${req.body.firstname} ${req.body.middlename} ${req.body.lastname}`,
                    intro: `Please confirm your registration by clicking the confirm button`,
                    action: {
                        instruction: 'Please confirm your registration by clicking the confirm button',
                        button: {
                            color: '#22BC66',
                            text: 'CONFIRM',
                            link: `${http_localhost}/burial-assistance/${create.id}/confirm`
                        },
                    },
                }
            }
            let mail = MailGenerator.generate(response)
            let message = {
                from: 'support@email.com',
                to: req.body.email,
                subject: 'social service',
                html: mail
            }
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            // res.redirect(`/burial-assistance/${create.id}/preview`)
            res.send('you are successfully registered! please check your email to confirm your registration.')
        })
        .catch(err => {
            console.log(err.message)
            res.status(404).render('err/notfound')
        })
    }
}
module.exports.burial_assistance_confirm = async(req, res) => {
    const id = req.params.id
    try {
        const confirm = await AICS_Confirmation.findByIdAndDelete(id)
        console.log(confirm)
        const create = await AICS_Registration({
            service: confirm.service,
            lastname: confirm.lastname,
            firstname: confirm.firstname,
            middlename: confirm.middlename,
            exname: confirm.exname,
            birthdate: confirm.birthdate,
            age: confirm.age,
            sex: confirm.sex,
            contact_number: confirm.contact_number,
            email: confirm.email,
            civil_status: confirm.civil_status,
            beneficiary_relationship: confirm.beneficiary_relationship,
            street: confirm.street,
            brgy: confirm.brgy,
            municipal: confirm.municipal,
            province: confirm.province,
            occupation: confirm.occupation,
            salary: confirm.salary,
            bene_lastname: confirm.bene_lastname,
            bene_firstname: confirm.bene_firstname,
            bene_middlename: confirm.bene_middlename,
            bene_exname: confirm.bene_exname,
            bene_birthdate: confirm.bene_birthdate,
            bene_age: confirm.bene_age,
            bene_sex: confirm.bene_sex,
            bene_contact_number: confirm.bene_contact_number,
            bene_civil_status: confirm.bene_civil_status,
            bene_street: confirm.bene_street,
            bene_brgy: confirm.bene_brgy,
            bene_municipal: confirm.bene_municipal,
            bene_province: confirm.bene_province,
            family_name: confirm.family_name,
            family_age: confirm.family_age,
            family_occupation: confirm.family_occupation,
            family_salary: confirm.family_salary,
        })
        create.save()
        .then(async() => {
            console.log(`${create} is created and confirmed`)
            let response = {
                body: {
                    name: `${create.firstname} ${create.middlename} ${create.lastname}`,
                    intro: 
                    `Congrats! You are successfully registered here is your reference number: ${create.reference}
                    Please click the link
                    <a href="${http_localhost}/burial-assistance/${create.id}/preview">here</a>
                    to download the form`,
                    action: {
                        instruction: `If your information is incorrect, you may edit your response here: `,
                        button: {
                            color: '#22BC66',
                            text: 'update response',
                            link: `${http_localhost}/burial-assistance/${create.id}/update-response`
                        },
                    },
                }
            }
            let mail = MailGenerator.generate(response)
            let message = {
                from: 'support@email.com',
                to: create.email,
                subject: 'social service',
                html: mail
            }
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            // res.send('confirmed')
            res.redirect(`/burial-assistance/${create.id}/preview`)
        })
    }catch(err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}

// preview of the submitted application
module.exports.burial_assistance_preview = async(req, res) => {
    const id = req.params.id
    try {
        const find = await AICS_Registration.findById(id)
        if(find){
            return res.render('user/aics/aics_preview', {find})
            // return res.send('successfully registered')
        }
        res.status(404).render('err/notfound')
    }catch(err){
        res.status(404).render('err/notfound')
    }
}
// get the old data then update
module.exports.burial_assistance_update_get = async(req, res) => {
    const id = req.params.id
    try {
        const find = await AICS_Registration.findById(id)
        if(find){
            let formatted = dateFormat(find.birthdate)
            let bene_formatted = dateFormat(find.bene_birthdate)
            return res.render('user/aics/form/update_form/bur_update_form', {find, formatted, bene_formatted})
        }else{
            return res.status(404).render('err/notfound')
        }
    }catch(err){
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}
module.exports.burial_assistance_update_post = async(req, res) => {
    const id = req.params.id
    const body = req.body
    await AICS_Registration.findByIdAndDelete(id)
    const create = await AICS_Registration(body)
    create.save()
    .then(() => {
        res.redirect(`/burial-assistance/${create.id}/preview`)
    })
}

module.exports.transportation_assistance = (req, res) => {
    res.render('user/aics/transportation')
}

module.exports.transportation_assistance_form_get = (req, res) => {
    res.render('user/aics/form/transportation_form')
}

module.exports.transportation_assistance_form_post = async(req, res) => {
    const body = req.body;
    let isConfirmed = await AICS_Confirmation.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(), bene_middlename: req.body.bene_middlename.toUpperCase(), bene_lastname: req.body.bene_lastname.toUpperCase(), bene_exname: req.body.bene_exname.toUpperCase()
    })
    let isRegistered = await AICS_Registration.findOne({bene_firstname: req.body.bene_firstname.toUpperCase(), bene_middlename: req.body.bene_middlename.toUpperCase(), bene_lastname: req.body.bene_lastname.toUpperCase(), bene_exname: req.body.bene_exname.toUpperCase()
    })
    if(isConfirmed){
        console.log(`is already registered in ${isConfirmed.service}`)
        res.redirect('/transportation-assistance')
    }else if(isRegistered){
        console.log(`is already registered in ${isRegistered.service}`)
        res.redirect('/transportation-assistance')
    }else{
        const create = await AICS_Confirmation(body)
        create.save()
        .then(async() => {
            console.log(`${create} is registered`)
            let response = {
                body: {
                    name: `${req.body.firstname} ${req.body.middlename} ${req.body.lastname}`,
                    intro: `Please confirm your registration by clicking the confirm button`,
                    action: {
                        instruction: 'Please confirm your registration by clicking the confirm button',
                        button: {
                            color: '#22BC66',
                            text: 'CONFIRM',
                            link: `${http_localhost}/transportation-assistance/${create.id}/confirm`
                        },
                    },
                }
            }
            let mail = MailGenerator.generate(response)
            let message = {
                from: 'support@email.com',
                to: req.body.email,
                subject: 'social service',
                html: mail
            }
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            // res.redirect(`/burial-assistance/${create.id}/preview`)
            res.send('you are successfully registered! please check your email to confirm your registration.')
        })
        .catch(err => {
            console.log(err.message)
            res.status(404).render('err/notfound')
        })
    }
}

module.exports.transportation_assistance_confirm = async(req, res) => {
    const id = req.params.id
    try {
        const confirm = await AICS_Confirmation.findByIdAndDelete(id)
        console.log(confirm)
        const create = await AICS_Registration({
            service: confirm.service,
            lastname: confirm.lastname,
            firstname: confirm.firstname,
            middlename: confirm.middlename,
            exname: confirm.exname,
            birthdate: confirm.birthdate,
            age: confirm.age,
            sex: confirm.sex,
            contact_number: confirm.contact_number,
            email: confirm.email,
            civil_status: confirm.civil_status,
            beneficiary_relationship: confirm.beneficiary_relationship,
            street: confirm.street,
            brgy: confirm.brgy,
            municipal: confirm.municipal,
            province: confirm.province,
            occupation: confirm.occupation,
            salary: confirm.salary,
            bene_lastname: confirm.bene_lastname,
            bene_firstname: confirm.bene_firstname,
            bene_middlename: confirm.bene_middlename,
            bene_exname: confirm.bene_exname,
            bene_birthdate: confirm.bene_birthdate,
            bene_age: confirm.bene_age,
            bene_sex: confirm.bene_sex,
            bene_contact_number: confirm.bene_contact_number,
            bene_civil_status: confirm.bene_civil_status,
            bene_street: confirm.bene_street,
            bene_brgy: confirm.bene_brgy,
            bene_municipal: confirm.bene_municipal,
            bene_province: confirm.bene_province,
            family_name: confirm.family_name,
            family_age: confirm.family_age,
            family_occupation: confirm.family_occupation,
            family_salary: confirm.family_salary,
        })
        create.save()
        .then(async() => {
            console.log(`${create} is created and confirmed`)
            let response = {
                body: {
                    name: `${create.firstname} ${create.middlename} ${create.lastname}`,
                    intro: `Congrats! You are successfully registered here is your reference number: ${create.reference}
                    Please click the link
                    <a href="${http_localhost}/transportation-assistance/${create.id}/preview">here</a>
                    to download the form`,
                    action: {
                        instruction: `If your information is incorrect, you may edit your response here: `,
                        button: {
                            color: '#22BC66',
                            text: 'update response',
                            link: `${http_localhost}/transportation-assistance/${create.id}/update-response`
                        },
                    },
                }
            }
            let mail = MailGenerator.generate(response)
            let message = {
                from: 'support@email.com',
                to: create.email,
                subject: 'social service',
                html: mail
            }
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            // res.send('confirmed')
            res.redirect(`/transportation-assistance/${create.id}/preview`)
        })
    }catch(err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}

module.exports.transportation_assistance_preview = async(req, res) => {
    const id = req.params.id
    try {
        const find = await AICS_Registration.findById(id)
        if(find){
            res.render('user/aics/aics_preview', {find})
            // return res.send('successfully registered')
        }
        res.status(404).render('err/notfound')
    }catch(err){
        res.status(404).render('err/notfound')
    }
}
module.exports.transportation_assistance_update_get = async(req, res) => {
    const id = req.params.id
    try {
        const find = await AICS_Registration.findById(id)
        if(find){
            let formatted = dateFormat(find.birthdate)
            let bene_formatted = dateFormat(find.bene_birthdate)
            return res.render('user/aics/form/update_form/tran_update_form', {find, formatted, bene_formatted})
        }else{
            return res.status(404).render('err/notfound')
        }
    }catch(err){
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}
module.exports.transportation_assistance_update_post = async(req, res) => {
    const id = req.params.id
    const body = req.body
    await AICS_Registration.findByIdAndDelete(id)
    const create = await AICS_Registration(body)
    create.save()
    .then(() => {
        res.redirect(`/transportation-assistance/${create.id}/preview`)
    })
}

module.exports.emergency_shelter_assistance = (req, res) => {
    res.render('user/aics/emergency')
}
module.exports.emergency_shelter_assistance_form_get = (req, res) => {
    res.render('user/aics/form/emergency_form')
}
module.exports.emergency_shelter_assistance_form_post = async(req, res) => {
    const body = req.body;
    let isConfirmed = await AICS_Confirmation.findOne({bene_firstname: req.body.bene_firstname.toUpperCase(), bene_middlename: req.body.bene_middlename.toUpperCase(), bene_lastname: req.body.bene_lastname.toUpperCase(), bene_exname: req.body.bene_exname.toUpperCase()
    })
    let isRegistered = await AICS_Registration.findOne({bene_firstname: req.body.bene_firstname.toUpperCase(), bene_middlename: req.body.bene_middlename.toUpperCase(), bene_lastname: req.body.bene_lastname.toUpperCase(), bene_exname: req.body.bene_exname.toUpperCase()
    })
    if(isConfirmed){
        console.log(`is already registered in ${isConfirmed.service}`)
        res.redirect('/emergency-shelter-assistance')
    }else if(isRegistered){
        console.log(`is already registered in ${isRegistered.service}`)
        res.redirect('/emergency-shelter-assistance')
    }else{
        const create = await AICS_Confirmation(body)
        create.save()
        .then(async() => {
            console.log(`${create} is registered`)
            let response = {
                body: {
                    name: `${req.body.firstname} ${req.body.middlename} ${req.body.lastname}`,
                    intro: `Please confirm your registration by clicking the confirm button`,
                    action: {
                        instruction: 'Please confirm your registration by clicking the confirm button',
                        button: {
                            color: '#22BC66',
                            text: 'CONFIRM',
                            link: `${http_localhost}/emergency-shelter-assistance/${create.id}/confirm`
                        },
                    },
                }
            }
            let mail = MailGenerator.generate(response)
            let message = {
                from: 'support@email.com',
                to: req.body.email,
                subject: 'social service',
                html: mail
            }
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            // res.redirect(`/burial-assistance/${create.id}/preview`)
            res.send('you are successfully registered! please check your email to confirm your registration.')
        })
        .catch(err => {
            console.log(err.message)
            res.status(404).render('err/notfound')
        })
    }
}

module.exports.emergency_shelter_assistance_confirm = async(req, res) => {
    const id = req.params.id
    try {
        const confirm = await AICS_Confirmation.findByIdAndDelete(id)
        console.log(confirm)
        const create = await AICS_Registration({
            service: confirm.service,
            lastname: confirm.lastname,
            firstname: confirm.firstname,
            middlename: confirm.middlename,
            exname: confirm.exname,
            birthdate: confirm.birthdate,
            age: confirm.age,
            sex: confirm.sex,
            contact_number: confirm.contact_number,
            email: confirm.email,
            civil_status: confirm.civil_status,
            beneficiary_relationship: confirm.beneficiary_relationship,
            street: confirm.street,
            brgy: confirm.brgy,
            municipal: confirm.municipal,
            province: confirm.province,
            occupation: confirm.occupation,
            salary: confirm.salary,
            bene_lastname: confirm.bene_lastname,
            bene_firstname: confirm.bene_firstname,
            bene_middlename: confirm.bene_middlename,
            bene_exname: confirm.bene_exname,
            bene_birthdate: confirm.bene_birthdate,
            bene_age: confirm.bene_age,
            bene_sex: confirm.bene_sex,
            bene_contact_number: confirm.bene_contact_number,
            bene_civil_status: confirm.bene_civil_status,
            bene_street: confirm.bene_street,
            bene_brgy: confirm.bene_brgy,
            bene_municipal: confirm.bene_municipal,
            bene_province: confirm.bene_province,
            family_name: confirm.family_name,
            family_age: confirm.family_age,
            family_occupation: confirm.family_occupation,
            family_salary: confirm.family_salary,
        })
        create.save()
        .then(async() => {
            console.log(`${create} is created and confirmed`)
            let response = {
                body: {
                    name: `${create.firstname} ${create.middlename} ${create.lastname}`,
                    intro: `Congrats! You are successfully registered here is your reference number: ${create.reference}
                    Please click the link
                    <a href="${http_localhost}/emergency-shelter-assistance/${create.id}/preview">here</a>
                    to download the form`,
                    action: {
                        instruction: `If your information is incorrect, you may edit your response here: `,
                        button: {
                            color: '#22BC66',
                            text: 'update response',
                            link: `${http_localhost}/emergency-shelter-assistance/${create.id}/update-response`
                        },
                    },
                }
            }
            let mail = MailGenerator.generate(response)
            let message = {
                from: 'support@email.com',
                to: create.email,
                subject: 'social service',
                html: mail
            }
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            // res.send('confirmed')
            res.redirect(`/emergency-shelter-assistance/${create.id}/preview`)
        })
    }catch(err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}

module.exports.emergency_shelter_assistance_preview = async(req, res) => {
    const id = req.params.id
    try {
        const find = await AICS_Registration.findById(id)
        if(find){
            res.render('user/aics/aics_preview', {find})
            // return res.send('successfully registered')
        }
        res.status(404).render('err/notfound')
    }catch(err){
        res.status(404).render('err/notfound')
    }
}
module.exports.emergency_shelter_assistance_update_get = async(req, res) => {
    const id = req.params.id
    try {
        const find = await AICS_Registration.findById(id)
        if(find){
            let formatted = dateFormat(find.birthdate)
            let bene_formatted = dateFormat(find.bene_birthdate)
            return res.render('user/aics/form/update_form/em_update_form', {find, formatted, bene_formatted})
        }else{
            return res.status(404).render('err/notfound')
        }
    }catch(err){
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}
module.exports.emergency_shelter_assistance_update_post = async(req, res) => {
    const id = req.params.id
    const body = req.body
    await AICS_Registration.findByIdAndDelete(id)
    const create = await AICS_Registration(body)
    create.save()
    .then(() => {
        res.redirect(`/transportation-assistance/${create.id}/preview`)
    })
}

module.exports.about = (req, res) => {
    res.render('user/about')
}

module.exports.search = async (req, res) => {
    // res.send(req.query.result)
    let reference = (req.query.result).split('-').join('');
    reference = reference.toUpperCase()
    let { service } = req.query;
    console.log(reference)
    console.log(service)
    let format = ''
    let result;
    result = await AICS_Registration.findOne(
        {
            $or: [
                {reference: reference, service: service},
                // {fullname: {$regex: reference}, service: service}
            ]
        }
    )
    if(result == null){
        console.log('not found in aics registration')
        result = await AICS_Record.findOne(
            {
                $or: [
                    {reference: reference, service: service},
                    // {fullname: {$regex: reference}, service: service}
                ]
            }
        )
        if(result == null){
            format = ''
            console.log('not found in aics records')
        }else{
            format = moment(result.expiredAt).format('MMMM DD, YYYY')
        }
    }else{
        console.log(`${reference} is found ${result}`)
    }
    res.render('user/search', {result, format}
)}