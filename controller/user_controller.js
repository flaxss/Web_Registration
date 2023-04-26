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

const Mailgen = require('mailgen')
const nodemailer = require('nodemailer')
const Educ_Registration = require('../model/Educ_Registration')

// calculate age
function birthdate(birth){
    const birthdate = new Date(birth);
    const differenceMs = Date.now() - birthdate.getTime();
    const age = Math.floor(differenceMs / (1000 * 60 * 60 * 24 * 365));
    return age
}

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

// let http_localhost = 'http://localhost:3000'
// let http_localhost = 'https://tmc-assistance.cyclic.app'
let http_localhost = 'tmc-assistance.cyclic.app'

// user and generate a template for the email
const config = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    },
    // proxy: http_localhost,
}
let transporter = nodemailer.createTransport(config)
let MailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: `CSWD`,
        link: `${http_localhost}`
    }
})

function messageResponse(fullname, link, email){
    let response = {
        body: {
            name: fullname.toUpperCase(),
            intro: `Please confirm your registration by clicking the <a href="${link}"><b>Confirm</b></a> button`,
            action: {
                instruction: ``,
                button: {
                    color: '#22BC66',
                    text: 'CONFIRM',
                    link: link
                },
            },
            outro: '<b>Important Note!</b> After cliking the Confirm button, you will receive another email. The email contains your Downloadable Intake Sheet and response. You can update your response if you notice typographical error(maling pagkakalagay ng impormasyon).'
        }
    }
    let mail = MailGenerator.generate(response)
    let message = {
        from: 'TMC-CSDWO <support@email.com>',
        to: email,
        subject: 'Email confirmation for your Cash Assistance',
        html: mail
    }
    return message;
}

function messageUpdate(fullname, service, reference, prev_link, up_link, email){
    let response = {
        body: {
            name: fullname,
            intro: `Congrats! Registered kana sa <b>${service}</b>. Ito and iyong reference number: ${reference} na maaari mong magamit upang matrack mo ang proseso ng iyong Application. Maaari mo ring i-download ang iyong intake sheet mula sa link na ito. <a href="${prev_link}">${prev_link}</a>. Kung gusto mo naman i-update ang iyong response. Pindutin ang  <b>UPDATE-RESPONSE</b>.`,
            action: {
                instruction: `If your information is incorrect, you may edit your response here: `,
                button: {
                    color: '#22BC66',
                    text: 'UPDATE RESPONSE',
                    link: up_link
                },
            },
            outro: '<b>Paalala!</b>, isang beses mo lang maaaring i-update ang iyong impormasyon.'
        }
    }
    let mail = MailGenerator.generate(response)
    let message = {
        from: 'TMC-CSDWO <support@email.com>',
        to: email,
        subject: 'Update Response / Downloadable General Intake Sheet',
        html: mail
    }
    return message;
}

module.exports.home = async(req, res) => {
    const renderPost = await Announcement.find({}).sort({createdAt: -1})
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

let response = ''

module.exports.college_assistance = (req, res) => {
    res.render('user/educ/college')
}

module.exports.college_assistance_form_get = async(req, res) => {
    const list = await Event.find().sort({nonFormat: 1})
    // let events = format(list)
    let events = list
    res.render('user/educ/form/college_form', {events})
}

var formData;

module.exports.college_assistance_form_post = async(req, res) => {
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
        res.redirect(`/college-assistance/${isConfirmed.id}/existing`)
    }else if(isAppointed){
        console.log(`already registered in ${isAppointed.service}`)
        res.redirect(`/college-assistance/${isAppointed.id}/existing`)
    }else if(isRegistered){
        console.log(`already registered in ${isRegistered.service}`)
        res.redirect(`/college-assistance/${isRegistered.id}/existing`)
    }else{
        const slot = await Event.findOne({event_date: req.body.event_date})
        if(!slot){
            return res.send("<h3>We're sorry, but the remaining slot is already occupied. Please try again later.</h3>")
        }
        const create = await Educ_Confirmation({
            service: 'College Educational Assistance',
            lastname: req.body.lastname,
            firstname: req.body.firstname,
            middlename: req.body.middlename,
            exname: req.body.exname,
            email: req.body.email,
            // appointment_date,
            event_date: req.body.event_date,
            r_street: req.body.r_street,
            r_brgy: req.body.r_brgy,
            r_municipal: req.body.r_municipal,
            r_province: req.body.r_province,
            r_full_address: `${req.body.r_street}, ${req.body.r_brgy}, ${req.body.r_municipal}, ${req.body.r_province}`,
            p_street: req.body.p_street,
            p_brgy: req.body.p_brgy,
            p_municipal: req.body.p_municipal,
            p_province: req.body.p_province,
            p_full_address: `${req.body.p_street}, ${req.body.p_brgy}, ${req.body.p_municipal}, ${req.body.p_province}`,
            date_of_birth: req.body.date_of_birth,
            place_of_birth: req.body.place_of_birth,
            citizenship: req.body.citizenship,
            // age: req.body.age,
            sex: req.body.sex,
            civil_status: req.body.civil_status,
            contact_number: req.body.contact_number,
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
        // formData = create
        // res.redirect('/college-assistance/summary')
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
            const fullname = `${create.firstname} ${create.middlename} ${create.lastname}`
            const link = `${http_localhost}/college-assistance/${create.id}/confirm`
            const message = messageResponse(fullname, link, create.email)
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            res.redirect(`/college-assistance/${create.id}`)
        })
        .catch(err => {
            console.log(err.message)
            res.status(404).render('err/notfound')
        })
    }
}

module.exports.college_assistance_exist = async(req, res) => {
    const id = req.params.id
    try {
        let respond = await Educ_Confirmation.findById(id)
        if(!respond){
            respond = await Educ_Appointment.findById(id)
            if(!respond){
                respond = await Educ_Registration.findById(id)
                if(!respond){
                    return res.status(404).render('err/notfound')
                }
            }
        }
        res.render('user/respond', {respond})
    } catch (err) {
        console.log(err.message)
            res.status(404).render('err/notfound')
    }
}

// summary ng form
module.exports.college_assistance_summary_get = async(req, res) => {
    if(formData){
        // console.log(formData)
        res.render('user/educ/form/college_summary', {formData})
    }else{
        res.status(404).render('err/notfound')
    }
}

module.exports.college_assistance_summary_post = async(req, res) => {
    if(formData){
        const create = formData
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
            const fullname = `${create.firstname} ${create.middlename} ${create.lastname}`
            const link = `${http_localhost}/college-assistance/${create.id}/confirm`
            const message = messageResponse(fullname, link, create.email)
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            formData = '' // reset to aviod duplicate
            res.redirect(`/college-assistance/${create.id}`)
        })
        .catch(err => {
            console.log(err.message)
            res.status(404).render('err/notfound')
        })
    }else{
        res.status(404).render('err/notfound')
    }
}
// summary ng form

module.exports.college_assistance_landing = async(req, res) => {
    const id = req.params.id
    try {
        const register = await Educ_Confirmation.findById(id)
        if(!register){
        res.status(404).render('user/nolonger_access')
        // return res.status(404).render('err/notfound')
        }
        res.render('user/warning', {register})
    } catch (err) {
        console.log(err.message)
        res.status(404).render('user/nolonger_access')
        // res.status(404).render('err/notfound')
    }
}

module.exports.college_assistance_confirm = async(req, res) => {
    const id = req.params.id
    try {
        const confirm = await Educ_Confirmation.findByIdAndDelete(id)
        console.log(confirm)
        if(!confirm){
            console.log(1)
            // return res.status(404).render('err/notfound')
            res.status(404).render('user/nolonger_access')
        }
        const create = await Educ_Appointment({
            service: confirm.service,
            reference: confirm.reference,
            lastname: confirm.lastname,
            firstname: confirm.firstname,
            middlename: confirm.middlename,
            exname: confirm.exname,
            email: confirm.email,
            event_date: confirm.event_date,
            r_street: confirm.r_street,
            r_brgy: confirm.r_brgy,
            r_municipal: confirm.r_municipal,
            r_province: confirm.r_province,
            r_full_address: config.r_full_address,
            p_street: confirm.p_street,
            p_brgy: confirm.p_brgy,
            p_municipal: confirm.p_municipal,
            p_province: confirm.p_province,
            p_full_address: config.p_full_address,
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
            console.log(2)
            console.log(`${create} is created`)
            const fullname = `${create.firstname} ${create.middlename} ${create.lastname}`
            const service = create.service
            const reference = create.reference
            const prev_link = `${http_localhost}/college-assistance/${create.id}/preview`
            const up_link = `${http_localhost}/college-assistance/${create.id}/update-response`
            const message = messageUpdate(fullname, service, reference, prev_link, up_link, create.email)
            await transporter.sendMail(message)
            .then((info) => {
                console.log(3)
                console.log('email is successfully generated',info.messageId)
            })
            console.log(4)
            res.redirect(`/college-assistance/${create.id}/preview`)
        })
    } catch (err) {
        console.log(err.message)
        // res.status(404).render('err/notfound')
        res.status(404).render('user/nolonger_access')
    }
}

module.exports.college_assistance_preview = async(req, res) => {
    const id = req.params.id;
    try {
        const find = await Educ_Appointment.findById(id);
        console.log(find)
        if(find){
            let date_of_birth = moment(find.date_of_birth).format('MMMM DD, YYYY')
            res.render('user/educ/form/college_preview', {find, date_of_birth})
        }else{
            // res.status(404).render('err/notfound')
            res.status(404).render('user/nolonger_access')
        }
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
        // res.status(404).render('user/nolonger_access')
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
        // res.status(404).render('err/notfound')
        res.status(404).render('user/nolonger_access')
    }
}
module.exports.college_assistance_update_post = async(req, res) => {
    const id = req.params.id
    console.log(req.body)
    await Educ_Appointment.findByIdAndDelete(id)
    try {
        const create = await Educ_Appointment({
            service: req.body.service,
            reference: req.body.reference,
            lastname: req.body.lastname,
            firstname: req.body.firstname,
            middlename: req.body.middlename,
            exname: req.body.exname,
            email: req.body.email,
            event_date: req.body.event_date,
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
    res.render('user/aics/medical', {response})
}
module.exports.medical_assistance_form_get = (req, res) => {
    res.render('user/aics/form/medical_form')
}
module.exports.medical_assistance_form_post = async(req, res) => {
    const body = req.body;
    console.log(body)
    const isConfirmed = await AICS_Confirmation.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(), bene_middlename: req.body.bene_middlename.toUpperCase(), bene_lastname: req.body.bene_lastname.toUpperCase(), bene_exname: req.body.bene_exname.toUpperCase()
    })
    const isRegistered = await AICS_Registration.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(), bene_middlename: req.body.bene_middlename.toUpperCase(), bene_lastname: req.body.bene_lastname.toUpperCase(), bene_exname: req.body.bene_exname.toUpperCase()
    })
    if(isConfirmed){
        console.log(`is already registered in ${isConfirmed.service}`)
        res.redirect(`/medical-assistance/${isConfirmed.id}/existing`)
    }else if(isRegistered){
        console.log(`is already registered in ${isRegistered.service}`)
        res.redirect(`/medical-assistance/${isRegistered.id}/existing`)
    }else{
        const create = await AICS_Confirmation(body)
        create.save()
        .then(async() => {
            console.log(`${create} is registered`)
            const fullname = `${create.firstname} ${create.middlename} ${create.lastname}`
            const link = `${http_localhost}/medical-assistance/${create.id}/confirm`
            const message = messageResponse(fullname, link, create.email)
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            res.redirect(`/medical-assistance/${create.id}`)
        })
        .catch(err => {
            console.log(err.message)
            res.status(404).render('err/notfound')
        })
    }
}

module.exports.medical_assistance_exist = async(req, res) => {
    const id = req.params.id
    try {
        let respond = await AICS_Confirmation.findById(id)
        if(!respond){
            respond = await AICS_Registration.findById(id)
            if(!respond){
                return res.status(404).render('err/notfound')
            }
        }
        res.render('user/respond', {respond})
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}

module.exports.medical_assistance_landing = async(req, res) => {
    const id = req.params.id
    try {
        const register = await AICS_Confirmation.findById(id)
        if(!register){
            // return res.status(404).render('err/notfound')
            return res.status(404).render('user/nolonger_access')
        }
        res.render('user/warning', {register})
    } catch (err) {
        console.log(err.message)
            res.status(404).render('err/notfound')
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
            const fullname = `${create.firstname} ${create.middlename} ${create.lastname}`
            const service = create.service
            const reference = create.reference
            const prev_link = `${http_localhost}/medical-assistance/${create.id}/preview`
            const up_link = `${http_localhost}/medical-assistance/${create.id}/update-response`
            const message = messageUpdate(fullname, service, reference, prev_link, up_link, create.email)
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            res.redirect(`/medical-assistance/${create.id}/preview`)
        })
    } catch (err) {
        console.log(err.message)
        // res.status(404).render('err/notfound')
        res.status(404).render('user/nolonger_access')
    }
}
// preview the submitted form
module.exports.medical_assistance_preview = async(req, res) => {
    const id = req.params.id
    try {
        const find = await AICS_Registration.findById(id)
        console.log(find)
        if(find){
            const formatted = moment(find.birthdate).format('MMMM DD, YYYY')
            const bene_formatted = moment(find.bene_birthdate).format('MMMM DD, YYYY')
            return res.render('user/aics/aics_preview', {find, formatted, bene_formatted})
        }
        res.status(404).render('err/notfound')
    }catch(err){
        // res.status(404).render('err/notfound')
        res.status(404).render('user/nolonger_access')
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
            // return res.status(404).render('err/notfound')
            return res.status(404).render('user/nolonger_access')
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
    res.render('user/aics/burial', {response})
}
module.exports.burial_assistance_form_get = (req, res) => {
    res.render('user/aics/form/burial_form', {response})
}
module.exports.burial_assistance_form_post = async(req, res) => {
    const body = req.body;
    let isConfirmed = await AICS_Confirmation.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(), bene_middlename: req.body.bene_middlename.toUpperCase(), bene_lastname: req.body.bene_lastname.toUpperCase(), bene_exname: req.body.bene_exname.toUpperCase()
    })
    let isRegistered = await AICS_Registration.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(), bene_middlename: req.body.bene_middlename.toUpperCase(), bene_lastname: req.body.bene_lastname.toUpperCase(), bene_exname: req.body.bene_exname.toUpperCase()
    })
    if(isConfirmed){
        console.log(`is already registered in ${isConfirmed.service}`)
        res.redirect(`/burial-assistance/${isConfirmed.id}/existing`)
    }else if(isRegistered){
        console.log(`is already registered in ${isRegistered.service}`)
        res.redirect(`/burial-assistance/${isRegistered.id}/existing`)
    }else{
        const create = await AICS_Confirmation(body)
        create.save()
        .then(async() => {
            console.log(`${create} is registered`)
            const fullname = `${create.firstname} ${create.middlename} ${create.lastname}`
            const link = `${http_localhost}/burial-assistance/${create.id}/confirm`
            const message = messageResponse(fullname, link, create.email)
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            res.redirect(`/burial-assistance/${create.id}`)
        })
        .catch(err => {
            console.log(err.message)
            res.status(404).render('err/notfound')
        })
    }
}

module.exports.burial_assistance_exist = async(req, res) => {
    const id = req.params.id
    try {
        let respond = await AICS_Confirmation.findById(id)
        if(!respond){
            respond = await AICS_Registration.findById(id)
            if(!respond){
                return res.status(404).render('err/notfound')
            }
        }
        res.render('user/respond', {respond})
    } catch (err) {
        console.log(err.message)
            res.status(404).render('err/notfound')
    }
}

module.exports.burial_assistance_landing = async(req, res) => {
    const id = req.params.id
    try {
        const register = await AICS_Confirmation.findById(id)
        if(!register){
            // return res.status(404).render('err/notfound')
            return res.status(404).render('user/nolonger_access')
        }
        res.render('user/warning', {register})
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
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
            const fullname = `${create.firstname} ${create.middlename} ${create.lastname}`
            const service = create.service
            const reference = create.reference
            const prev_link = `${http_localhost}/burial-assistance/${create.id}/preview`
            const up_link = `${http_localhost}/burial-assistance/${create.id}/update-response`
            const message = messageUpdate(fullname, service, reference, prev_link, up_link, create.email)
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            res.redirect(`/burial-assistance/${create.id}/preview`)
        })
    }catch(err) {
        console.log(err.message)
        // res.status(404).render('err/notfound')
        res.status(404).render('user/nolonger_access')
    }
}

// preview of the submitted application
module.exports.burial_assistance_preview = async(req, res) => {
    const id = req.params.id
    try {
        const find = await AICS_Registration.findById(id)
        if(find){
            const formatted = moment(find.birthdate).format('MMMM DD, YYYY')
            const bene_formatted = moment(find.bene_birthdate).format('MMMM DD, YYYY')
            return res.render('user/aics/aics_preview', {find, formatted, bene_formatted})
        }
        res.status(404).render('err/notfound')
        // res.status(404).render('user/nolonger_access')
    }catch(err){
        // res.status(404).render('err/notfound')
        res.status(404).render('user/nolonger_access')
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
    res.render('user/aics/transportation', {response})
}

module.exports.transportation_assistance_form_get = (req, res) => {
    res.render('user/aics/form/transportation_form')
}

module.exports.transportation_assistance_form_post = async(req, res) => {
    const body = req.body;
    let isConfirmed = await AICS_Confirmation.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(), bene_middlename: req.body.bene_middlename.toUpperCase(), bene_lastname: req.body.bene_lastname.toUpperCase(), bene_exname: req.body.bene_exname.toUpperCase()
    })
    let isRegistered = await AICS_Registration.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(), bene_middlename: req.body.bene_middlename.toUpperCase(), bene_lastname: req.body.bene_lastname.toUpperCase(), bene_exname: req.body.bene_exname.toUpperCase()
    })
    if(isConfirmed){
        console.log(`is already registered in ${isConfirmed.service}`)
        res.redirect(`/transportation-assistance/${isConfirmed.id}/existing`)
    }else if(isRegistered){
        console.log(`is already registered in ${isRegistered.service}`)
        res.redirect(`/transportation-assistance/${isRegistered.id}/existing`)
    }else{
        const create = await AICS_Confirmation(body)
        create.save()
        .then(async() => {
            console.log(`${create} is registered`)
            const fullname = `${create.firstname} ${create.middlename} ${create.lastname}`
            const link = `${http_localhost}/transportation-assistance/${create.id}/confirm`
            const message = messageResponse(fullname, link, create.email)
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            res.redirect(`/transportation-assistance/${create.id}`)
        })
        .catch(err => {
            console.log(err.message)
            res.status(404).render('err/notfound')
        })
    }
}

module.exports.transportation_assistance_exist = async(req, res) => {
    const id = req.params.id
    try {
        let respond = await AICS_Confirmation.findById(id)
        if(!respond){
            respond = await AICS_Registration.findById(id)
            if(!respond){
                return res.status(404).render('err/notfound')
            }
        }
        res.render('user/respond', {respond})
    } catch (err) {
        console.log(err.message)
            res.status(404).render('err/notfound')
    }
}

module.exports.transportation_assistance_landing = async(req, res) => {
    const id = req.params.id
    try {
        const register = await AICS_Confirmation.findById(id)
        if(!register){
            // return res.status(404).render('err/notfound')
            return res.status(404).render('user/nolonger_access')
        }
        res.render('user/warning', {register})
    } catch (err) {
        console.log(err.message)
            res.status(404).render('err/notfound')
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
            const fullname = `${create.firstname} ${create.middlename} ${create.lastname}`
            const service = create.service
            const reference = create.reference
            const prev_link = `${http_localhost}/transportation-assistance/${create.id}/preview`
            const up_link = `${http_localhost}/transportation-assistance/${create.id}/update-response`
            const message = messageUpdate(fullname, service, reference, prev_link, up_link, create.email)
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            res.redirect(`/transportation-assistance/${create.id}/preview`)
        })
    }catch(err) {
        console.log(err.message)
        // res.status(404).render('err/notfound')
        res.status(404).render('user/nolonger_access')
    }
}

module.exports.transportation_assistance_preview = async(req, res) => {
    const id = req.params.id
    try {
        const find = await AICS_Registration.findById(id)
        if(find){
            const formatted = moment(find.birthdate).format('MMMM DD, YYYY')
            const bene_formatted = moment(find.bene_birthdate).format('MMMM DD, YYYY')
            return res.render('user/aics/aics_preview', {find, formatted, bene_formatted})
        }
        res.status(404).render('err/notfound')
        // res.status(404).render('user/nolonger_access')
    }catch(err){
        // res.status(404).render('err/notfound')
        res.status(404).render('user/nolonger_access')
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
    res.render('user/aics/emergency', {response})
}
module.exports.emergency_shelter_assistance_form_get = (req, res) => {
    res.render('user/aics/form/emergency_form')
}
module.exports.emergency_shelter_assistance_form_post = async(req, res) => {
    const body = req.body;
    let isConfirmed = await AICS_Confirmation.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(), bene_middlename: req.body.bene_middlename.toUpperCase(), bene_lastname: req.body.bene_lastname.toUpperCase(), bene_exname: req.body.bene_exname.toUpperCase()
    })
    let isRegistered = await AICS_Registration.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(), bene_middlename: req.body.bene_middlename.toUpperCase(), bene_lastname: req.body.bene_lastname.toUpperCase(), bene_exname: req.body.bene_exname.toUpperCase()
    })
    if(isConfirmed){
        console.log(`is already registered in ${isConfirmed.service}`)
        res.redirect(`/emergency-shelter-assistance/${isConfirmed.id}/existing`)
    }else if(isRegistered){
        console.log(`is already registered in ${isRegistered.service}`)
        res.redirect(`/emergency-shelter-assistance/${isRegistered.id}/existing`)
    }else{
        const create = await AICS_Confirmation(body)
        create.save()
        .then(async() => {
            console.log(`${create} is registered`)
            const fullname = `${create.firstname} ${create.middlename} ${create.lastname}`
            const link = `${http_localhost}/emergency-shelter-assistance/${create.id}/confirm`
            const message = messageResponse(fullname, link, create.email)
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            res.redirect(`/emergency-shelter-assistance/${create.id}`)
        })
        .catch(err => {
            console.log(err.message)
            res.status(404).render('err/notfound')
        })
    }
}

module.exports.emergency_shelter_assistance_exist = async(req, res) => {
    const id = req.params.id
    try {
        let respond = await AICS_Confirmation.findById(id)
        if(!respond){
            respond = await AICS_Registration.findById(id)
            if(!respond){
                return res.status(404).render('err/notfound')
            }
        }
        res.render('user/respond', {respond})
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}

module.exports.emergency_shelter_assistance_landing = async(req, res) => {
    const id = req.params.id
    try {
        const register = await AICS_Confirmation.findById(id)
        if(!register){
            // return res.status(404).render('err/notfound')
            return res.status(404).render('user/nolonger_access')
        }
        res.render('user/warning', {register})
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
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
            const fullname = `${create.firstname} ${create.middlename} ${create.lastname}`
            const service = create.service
            const reference = create.reference
            const prev_link = `${http_localhost}/emergency-shelter-assistance/${create.id}/preview`
            const up_link = `${http_localhost}/emergency-shelter-assistance/${create.id}/update-response`
            const message = messageUpdate(fullname, service, reference, prev_link, up_link, create.email)
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
            res.redirect(`/emergency-shelter-assistance/${create.id}/preview`)
        })
    }catch(err) {
        console.log(err.message)
        // res.status(404).render('err/notfound')
        res.status(404).render('user/nolonger_access')
    }
}

module.exports.emergency_shelter_assistance_preview = async(req, res) => {
    const id = req.params.id
    try {
        const find = await AICS_Registration.findById(id)
        if(find){
            const formatted = moment(find.birthdate).format('MMMM DD, YYYY')
            const bene_formatted = moment(find.bene_birthdate).format('MMMM DD, YYYY')
            return res.render('user/aics/aics_preview', {find, formatted, bene_formatted})
            // return res.send('successfully registered')
        }
        res.status(404).render('err/notfound')
        // res.status(404).render('user/nolonger_access')
    }catch(err){
        // res.status(404).render('err/notfound')
        res.status(404).render('user/nolonger_access')
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
    reference = reference.split(' ').join('');
    reference = reference.toUpperCase()
    let { service } = req.query;
    console.log(reference)
    console.log(service)
    let format = ''
    let result;
    result = await Educ_Confirmation.findOne(
        {
            $or: [
                {reference: reference, service: service},
                // {fullname: {$regex: reference}, service: service}
            ]
        }
    )
    if(result == null){
        console.log('not found in educ confirmation')
        result = await Educ_Appointment.findOne(
            {
                $or: [
                    {reference: reference, service: service},
                    // {fullname: {$regex: reference}, service: service}
                ]
            }
        )
        if(result == null){
            console.log('not found in educ appointment')
            result = await Educ_Registration.findOne(
                {
                    $or: [
                        {reference: reference, service: service},
                        // {fullname: {$regex: reference}, service: service}
                    ]
                }
            )
            if(result == null){
                console.log('not found in educ registration')
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
            }else{
                console.log(`${reference} is found ${result}`)
            }
        }else{
            console.log(`${reference} is found ${result}`)
        }
        
    }else{
        console.log(`${reference} is found ${result}`)
    }
    res.render('user/search', {result, format}
)}