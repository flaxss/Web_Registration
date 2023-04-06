const fs = require('fs');
const bcrypt = require('bcrypt')
const moment = require('moment')

const Account = require('../model/Account')
const Announcement = require('../model/Announcement')

const Educ_Confirmation = require('../model/Educ_Confirmation')
const Educ_Appointment = require('../model/Educ_Appointment')
const Educ_Registration = require('../model/Educ_Registration')
const Educ_Record = require('../model/Educ_Record')
const Educ_Compile = require('../model/Educ_Compile')
const AICS_Confirmation = require('../model/AICS_Confirmation')
const AICS_Registration = require('../model/AICS_Registration')
const AICS_Record = require('../model/AICS_Record')
const AICS_Compile = require('../model/AICS_Compile')
const Event = require('../model/Event')
const Option = require('../model/Option');

async function expiryDate(){
    let today = new Date();
    let expired = await AICS_Record.find({expiredAt: {$lt: today}})
    if(expired != ''){
        expired.forEach(async(data) => {
            const list = new AICS_Compile({
                service: data.service,
                client_name: `${data.firstname} ${data.middlename} ${data.lastname} ${data.exname}`,
                beneficiary_name: `${data.bene_firstname} ${data.bene_middlename} ${data.bene_lastname} ${data.bene_exname}`,
                sex: data.bene_sex,
                address: data.bene_full_address,
                contact_number: data.bene_contact_number,
                email: data.email,
            })
            list.save()
            await AICS_Record.deleteMany({expiredAt: {$lt: today}})
            console.log(list)
        })
    }
}
// expiryDate()

// parse date
const {dateFormat} = require('../middleware/parseDate')
// console.log(dateFormat(new Date()))

// email generation
const dotenv = require('dotenv');
dotenv.config({path: 'config.env'});

const Mailgen = require('mailgen')
const nodemailer = require('nodemailer')

let config = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
}

let transporter = nodemailer.createTransport(config)
let MailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'CSWD OFFICE',
        link: 'https://mailgen.js'
    }
})

// home
module.exports.admin_home = async(req, res) => {
    const events = await Event.find().sort({nonFormat: 1})
    const renderPost = await Announcement.find().sort({createdAt: -1})
    res.render('admin/home', {renderPost, events})
}

// home create post
module.exports.create_post = async(req, res) => {
    const { header, post } = req.body;
    const create = await Announcement({
        header: header,
        post: post,
        author: res.locals.user.firstname,
    })
    create.save()
    .then(() => {
        console.log(`${create} is posted`)
        res.redirect('/a')
    })
    .catch((err) => {
        console.log(err.message)
        res.status(404).render('err/notfound')
    })
}

// home edit post
module.exports.edit_post_get = async(req, res) => {
    const id = req.params.id;
    const findPost = await Announcement.findById(id)
    const events = await Event.find().sort({nonFormat: 1})
    res.render('admin/edit_post', {findPost, events})
}

module.exports.edit_post_patch = async(req, res) => {
    try {
        const id = req.params.id;
        const {header, post} = req.body;
        const options = {new: true}
        const update = await Announcement.findByIdAndUpdate(id, {
            header: header,
            post: post,
            editor: res.locals.user.firstname,
            updatedAt: new Date()
        }, options)
        console.log(`${update} post is updated`)
        res.redirect('/a')
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}
// create event
module.exports.add_event = async(req, res) => {
    const create = await Event({
        quota: req.body.quota,
        event_date: req.body.event_date,
        remarks: req.body.remarks || 'None'
    })
    console.log(req.body)
    create.save()
    .then(() => {
        res.redirect('/a')
    })
    .catch(err => {
        console.log(err.message)
    })
}

// appointment page

module.exports.appointment = async(req, res) => {
    const renderAppointment = await Educ_Appointment.find().sort({fullname: 1})
    let formatted = dateFormat(renderAppointment.appointment_date)
    // console.log(formatted)
    let opt = await Option.findOne()
    opt = opt.option
    res.render('admin/appointment', {renderAppointment, formatted, opt})
}

module.exports.appointment_activate = async(req, res) => {
    const options = {new: true}
    const update = await Option.updateOne({option: 'deactivate'}, {option: 'activate'}, options)
    res.redirect('/a/appointment')
}

module.exports.appointment_deactivate = async(req, res) => {
    const options = {new: true}
    const update = await Option.updateOne({option: 'activate'}, {option: 'deactivate'}, options)
    res.redirect('/a/appointment')
}

module.exports.appointment_reject = async(req, res) => {
    try {
        const reject = await Educ_Appointment.findByIdAndDelete(req.params.id)
        console.log(reject)
        res.redirect('/a/appointment')
    } catch (err) {
        console.log(err.message)
    }
}

module.exports.appointment_view = async(req, res) => {
    try {
        const id = req.params.id;
        const find = await Educ_Appointment.findById(id);
        console.log(find)
        let date_of_birth = moment(find.date_of_birth).format('MMMM DD, YYYY')
        res.render('admin/action/view_college', {find, date_of_birth})
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}

module.exports.appointment_update_get = async(req, res) => {
    const id = req.params.id;
    try {
        const appointment = await Educ_Appointment.findById(id)
        let formatted = dateFormat(appointment.appointment_date)
        res.render('admin/action/college_form', {appointment, formatted})
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}

module.exports.appointment_update_post = async(req, res) => {
    const id = req.params.id
    const body = req.body
    console.log(body)
    const update = await Educ_Appointment.findByIdAndUpdate(id, {
        reference: body.reference,
        service: body.service,
        lastname: body.lastname,
        firstname: body.firstname,
        middlename: body.middlename,
        exname: body.exname,
        fullname: body.fullname,
        email: body.email,
        // appointment_date: body.appointment_date,
        event_date: body.event_date,
        r_street: body.r_street,
        r_brgy: body.r_brgy,
        r_municipal: body.r_municipal,
        r_province: body.r_province,
        r_full_address: body.r_full_address,
        p_street: body.p_street,
        p_brgy: body.p_brgy,
        p_municipal: body.p_municipal,
        p_province: body.p_province,
        date_of_birth: body.date_of_birth,
        place_of_birth: body.place_of_birth,
        citizenship: body.citizenship,
        age: body.age,
        sex: body.sex,
        civil_status: body.civil_status,
        contact_number: body.contact_number,
        spouse_lname: body.spouse_lname,
        spouse_fname: body.spouse_fname,
        spouse_mname: body.spouse_mname,
        spouse_exname: body.spouse_exname,
        spouse_occupation: body.spouse_occupation,
        mother_lname: body.mother_lname,
        mother_fname: body.mother_fname,
        mother_mname: body.mother_mname,
        mother_occupation: body.mother_occupation,
        father_lname: body.father_lname,
        father_fname: body.father_fname,
        father_mname: body.father_mname,
        father_exname: body.father_exname,
        father_occupation: body.father_occupation,
        elementary: {
            name_of_school: body.e_name_of_school,
            school_year: body.e_school_year,
        },
        secondary: {
            name_of_school: body.s_name_of_school,
            school_year: body.s_school_year
        },
        vocational: {
            name_of_school: body.v_school_year,
            school_year: body.v_school_year
        },
        college: {
            name_of_school: body.c_school_year,
            school_year: body.c_school_year
        },
        course: body.course,
        year_level: body.year_level,
        sem: body.sem,
    }, {new: true})
    res.redirect('/a/appointment')
}

module.exports.appointment_accept = async(req, res) => {
    try {
        const find = await Educ_Appointment.findByIdAndDelete(req.params.id)
        const create = await Educ_Registration({
            reference: find.reference,
            service: find.service,
            lastname: find.lastname,
            firstname: find.firstname,
            middlename: find.middlename,
            exname: find.exname,
            email: find.email,
            // appointment_date: find.appointment_date,
            r_street: find.r_street,
            r_brgy: find.r_brgy,
            r_municipal: find.r_municipal,
            r_province: find.r_province,
            r_full_address: find.r_full_address,
            p_street: find.p_street,
            p_brgy: find.p_brgy,
            p_municipal: find.p_municipal,
            p_province: find.p_province,
            p_full_address: find.p_full_address,
            date_of_birth: find.date_of_birth,
            place_of_birth: find.place_of_birth,
            citizenship: find.citizenship,
            age: find.age,
            sex: find.sex,
            civil_status: find.civil_status,
            contact_number: find.contact_number,
            spouse_lname: find.spouse_lname,
            spouse_fname: find.spouse_fname,
            spouse_mname: find.spouse_mname,
            spouse_exname: find.spouse_exname,
            spouse_occupation: find.spouse_occupation,
            mother_lname: find.mother_lname,
            mother_fname: find.mother_fname,
            mother_mname: find.mother_mname,
            mother_occupation: find.mother_occupation,
            father_lname: find.father_lname,
            father_fname: find.father_fname,
            father_mname: find.father_mname,
            father_exname: find.father_exname,
            father_occupation: find.father_occupation,
            elementary: {
                name_of_school: find.elementary.name_of_school,
                school_year: find.elementary.school_year,
            },
            secondary: {
                name_of_school: find.secondary.name_of_school,
                school_year: find.secondary.school_year
            },
            vocational: {
                name_of_school: find.vocational.name_of_school,
                school_year: find.vocational.school_year
            },
            college: {
                name_of_school: find.college.name_of_school,
                school_year: find.college.school_year
            },
            course: find.course,
            year_level: find.year_level,
            sem: find.sem,
        })
        create.save()
        .then(() => {
            console.log(`${create} is registered`)
            res.redirect('/a/appointment')
        })
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}

// application page

module.exports.application_educ_assistance = async(req, res) => {
    const render = await Educ_Registration.find({service: 'College Educational Assistance', isArchive: false}).sort({fullname: 1})
    res.render('admin/application', {render})
}

module.exports.application_educ_assistance_accept = async(req, res) => {
    const id = req.params.id;
    const find = await Educ_Registration.findByIdAndDelete(id);
    const create = await Educ_Record({
        reference: find.reference,
        service: find.service,
        lastname: find.lastname,
        firstname: find.firstname,
        middlename: find.middlename,
        exname: find.exname,
        fullname: find.fullname,
        email: find.email,
        appointment_date: find.appointment_date,
        r_street: find.r_street,
        r_brgy: find.r_brgy,
        r_municipal: find.r_municipal,
        r_province: find.r_province,
        r_full_address: find.r_full_address,
        p_street: find.p_street,
        p_brgy: find.p_brgy,
        p_municipal: find.p_municipal,
        p_province: find.p_province,
        p_full_address: find.p_full_address,
        date_of_birth: find.date_of_birth,
        place_of_birth: find.place_of_birth,
        citizenship: find.citizenship,
        age: find.age,
        sex: find.sex,
        civil_status: find.civil_status,
        contact_number: find.contact_number,
        spouse_lname: find.spouse_lname,
        spouse_fname: find.spouse_fname,
        spouse_mname: find.spouse_mname,
        spouse_exname: find.spouse_exname,
        spouse_occupation: find.spouse_occupation,
        mother_lname: find.mother_lname,
        mother_fname: find.mother_fname,
        mother_mname: find.mother_mname,
        mother_occupation: find.mother_occupation,
        father_lname: find.father_lname,
        father_fname: find.father_fname,
        father_mname: find.father_mname,
        father_exname: find.father_exname,
        father_occupation: find.father_occupation,
        elementary: {
            name_of_school: find.elementary.name_of_school,
            school_year: find.elementary.school_year,
        },
        secondary: {
            name_of_school: find.secondary.name_of_school,
            school_year: find.secondary.school_year
        },
        vocational: {
            name_of_school: find.vocational.name_of_school,
            school_year: find.vocational.school_year
        },
        college: {
            name_of_school: find.college.name_of_school,
            school_year: find.college.school_year
        },
        course: find.course,
        year_level: find.year_level,
        sem: find.sem,
    })
    create.save()
    .then(() => {
        console.log(`${create} is completed`)
        res.redirect('/a/application-educ-assistance')
    })
    .catch((err) => {
        console.log(err.message)
        res.status(404).render('err/notfound')
    })
}

module.exports.application_educ_assistance_view = async(req, res) => {
    try {
        const id = req.params.id;
        const find = await Educ_Registration.findById(id);
        let date_of_birth = moment(find.date_of_birth).format('MMMM DD, YYYY')
        res.render('admin/action/view_college', {find, date_of_birth})
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}

module.exports.application_educ_assistance_update_get = async(req, res) => {
    const id = req.params.id;
    try {
        const appointment = await Educ_Registration.findById(id)
        let formatted = dateFormat(appointment.appointment_date)
        res.render('admin/form/update_form/college_form', {appointment, formatted})
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}

module.exports.application_educ_assistance_update_patch = async(req, res) => {
    const id = req.params.id;
    const body = req.body
    console.log(req.body)
    const update = await Educ_Registration.findByIdAndUpdate(id, {
        reference: body.reference,
        service: body.service,
        lastname: body.lastname,
        firstname: body.firstname,
        middlename: body.middlename,
        exname: body.exname,
        email: body.email,
        // appointment_date: body.appointment_date,
        r_street: body.r_street,
        r_brgy: body.r_brgy,
        r_municipal: body.r_municipal,
        r_province: body.r_province,
        r_full_address: body.r_full_address,
        p_street: body.p_street,
        p_brgy: body.p_brgy,
        p_municipal: body.p_municipal,
        p_province: body.p_province,
        date_of_birth: body.date_of_birth,
        place_of_birth: body.place_of_birth,
        citizenship: body.citizenship,
        age: body.age,
        sex: body.sex,
        civil_status: body.civil_status,
        contact_number: body.contact_number,
        spouse_lname: body.spouse_lname,
        spouse_fname: body.spouse_fname,
        spouse_mname: body.spouse_mname,
        spouse_exname: body.spouse_exname,
        spouse_occupation: body.spouse_occupation,
        mother_lname: body.mother_lname,
        mother_fname: body.mother_fname,
        mother_mname: body.mother_mname,
        mother_occupation: body.mother_occupation,
        father_lname: body.father_lname,
        father_fname: body.father_fname,
        father_mname: body.father_mname,
        father_exname: body.father_exname,
        father_occupation: body.father_occupation,
        elementary: {
            name_of_school: body.e_name_of_school,
            school_year: body.e_school_year,
        },
        secondary: {
            name_of_school: body.s_name_of_school,
            school_year: body.s_school_year
        },
        vocational: {
            name_of_school: body.v_school_year,
            school_year: body.v_school_year
        },
        college: {
            name_of_school: body.c_school_year,
            school_year: body.c_school_year
        },
        course: body.course,
        year_level: body.year_level,
        sem: body.sem,
    }, {new: true})
    res.redirect('/a/application-educ-assistance')
}

module.exports.application_educ_assistance_archive = async (req, res) => {
    const id = req.params.id;
    const registration = await Educ_Registration.findByIdAndUpdate(id, {isArchive: true}, {new: true})
    console.log(registration)
    res.redirect('/a/application-educ-assistance')
}

module.exports.application_medical_assistance = async(req, res) => {
    const render = await AICS_Registration.find({service: 'Medical Assistance', isArchive: false}).sort({fullname: 1})
    res.render('admin/application', {render})
}

module.exports.application_burial_assistance = async(req, res) => {
    const render = await AICS_Registration.find({service: 'Burial Assistance', isArchive: false}).sort({fullname: 1})
    res.render('admin/application', {render})
}

module.exports.application_transportation_assistance = async(req, res) => {
    const render = await AICS_Registration.find({service: 'Transportation Assistance', isArchive: false}).sort({fullname: 1})
    res.render('admin/application', {render})
}

module.exports.application_emergency_assistance = async(req, res) => {
    const render = await AICS_Registration.find({service: 'Emergency Shelter Assistance', isArchive: false}).sort({fullname: 1})
    res.render('admin/application', {render})
}

module.exports.application_aics_assistance_accept = async(req, res) => {
    try {
        const id = req.params.id;
        const find = await AICS_Registration.findByIdAndDelete(id)
        let params = ''
        if(find.service == 'Medical Assistance'){
            params = 'application-medical-assistance'
        }else if(find.service == 'Burial Assistance'){
            params = 'application-burial-assistance'
        }else if(find.service == 'Transportation Assistance'){
            params = 'application-transportation-assistance'
        }else if(find.service == 'Emergency Shelter Assistance'){
            params = 'application-emergency-assistance'
        }
        const create = await AICS_Record({
            reference: find.reference,
            service: find.service,
            lastname: find.lastname,
            firstname: find.firstname,
            middlename: find.middlename,
            exname: find.exname,
            fullname: find.fullname,
            birthdate: find.birthdate,
            age: find.age,
            sex: find.sex,
            contact_number: find.contact_number,
            civil_status: find.civil_status,
            email: find.email,
            beneficiary_relationship: find.beneficiary_relationship,
            street: find.street,
            brgy: find.brgy,
            municipal: find.municipal,
            province: find.province,
            fulladdress: `${find.street} ${find.brgy} ${find.municipal} ${find.province}` ,
            occupation: find.occupation,
            salary: find.salary,
            bene_lastname: find.bene_lastname,
            bene_firstname: find.bene_firstname,
            bene_middlename: find.bene_middlename,
            bene_exname: find.bene_exname,
            bene_birthdate: find.bene_birthdate,
            bene_age: find.bene_age,
            bene_sex: find.bene_sex,
            bene_contact_number: find.bene_contact_number,
            bene_civil_status: find.bene_civil_status,
            bene_street: find.bene_street,
            bene_brgy: find.bene_brgy,
            bene_municipal: find.bene_municipal,
            bene_province: find.bene_province,
            bene_full_address: `${find.bene_street} ${find.bene_brgy} ${find.bene_municipal} ${find.bene_province}`,
        })
        create.save()
        .then(() => {
            console.log(`${create} is completed`)
            res.redirect(`/a/${params}`)
        })
        .catch((err) => {
            console.log(err.message)
        })
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}

module.exports.application_aics_assistance_view = async(req, res) => {
    const id = req.params.id
    try {
        const find = await AICS_Registration.findById(id)
        if(find){
            const formatted = moment(find.birthdate).format('MMMM DD, YYYY')
            const bene_formatted = moment(find.bene_birthdate).format('MMMM DD, YYYY')
            return res.render('admin/form/aics_preview', {find, formatted, bene_formatted})
        }else{
            return res.status(404).render('err/notfound')
        }
    }catch(err){
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}

module.exports.application_aics_assistance_get = async(req, res) => {
    const id = req.params.id
    try {
        const find = await AICS_Registration.findById(id)
        // let formatted = dateFormat(find.birthdate)
        // let bene_formatted = dateFormat(find.bene_birthdate)
        let formatted = find.birthdate
        let bene_formatted = find.bene_birthdate
        res.render('admin/form/update_form/burial_form', {find, formatted, bene_formatted})
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}

module.exports.application_aics_assistance_patch = async(req, res) => {
    const id = req.params.id;
    const body = req.body
    try {
        const find = await AICS_Registration.findByIdAndUpdate(id, body, {new: true})
        let params = ''
        if(find.service == 'Medical Assistance'){
            params = 'application-medical-assistance'
        }else if(find.service == 'Burial Assistance'){
            params = 'application-burial-assistance'
        }else if(find.service == 'Transportation Assistance'){
            params = 'application-transportation-assistance'
        }else if(find.service == 'Emergency Shelter Assistance'){
            params = 'application-emergency-assistance'
        }
        res.redirect(`/a/${params}`)
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}

module.exports.application_aics_assistance_archive = async (req, res) => {
    const id = req.params.id;
    const registration = await AICS_Registration.findByIdAndUpdate(id, {isArchive: true}, {new: true})
    res.redirect('/a/application-burial-assistance')
}

// archive restore and remove
module.exports.application_archives = async (req, res) => {
    const aics_archive = await AICS_Registration.find({isArchive: true})
    const educ_archive = await Educ_Registration.find({isArchive: true})
    res.render('admin/application_archive', {educ_archive, aics_archive})
}

module.exports.application_educ_archives_restore = async (req, res) => {
    const id = req.params.id
    const archive = await Educ_Registration.findByIdAndUpdate(id, {isArchive: false}, {new: true})
    res.redirect('/a/application-archive')
}

module.exports.application_educ_archives_delete = async (req, res) => {
    const id = req.params.id
    const archive = await Educ_Registration.findByIdAndDelete(id)
    res.redirect('/a/application-archive')
}

module.exports.application_aics_archives_restore = async (req, res) => {
    const id = req.params.id
    const archive = await AICS_Registration.findByIdAndUpdate(id, {isArchive: false}, {new: true})
    res.redirect('/a/application-archive')
}

module.exports.application_aics_archives_delete = async (req, res) => {
    const id = req.params.id
    const archive = await AICS_Registration.findByIdAndDelete(id)
    res.redirect('/a/application-archive')
}

// register
module.exports.register_burial_get = (req, res) => {
    res.render('admin/form/burial_reg_form')
}

module.exports.register_burial_post = async(req, res) => {
    const body = req.body;
    const isConfirmed = await AICS_Confirmation.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(),
        bene_middlename: req.body.bene_middlename.toUpperCase(),
        bene_lastname: req.body.bene_lastname.toUpperCase(),
        bene_exname: req.body.bene_exname.toUpperCase()
    })
    const isRegistered = await AICS_Registration.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(),
        bene_middlename: req.body.bene_middlename.toUpperCase(),
        bene_lastname: req.body.bene_lastname.toUpperCase(),
        bene_exname: req.body.bene_exname.toUpperCase()
    })
    if(!isRegistered && !isConfirmed){
        const create = await AICS_Registration(body)
        create.save()
        .then(() => {
            console.log(`${create} is created`)
            res.send('successfully registered')
        })
        .catch(err => {
            console.log(err.message)
        })
    }else{
        res.send('already registered')
    }
}

module.exports.register_medical_get = (req, res) => {
    res.render('admin/form/medical_reg_form')
}

module.exports.register_medical_post = async(req, res) => {
    const body = req.body;
    const isConfirmed = await AICS_Confirmation.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(),
        bene_middlename: req.body.bene_middlename.toUpperCase(),
        bene_lastname: req.body.bene_lastname.toUpperCase(),
        bene_exname: req.body.bene_exname.toUpperCase()
    })
    const isRegistered = await AICS_Registration.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(),
        bene_middlename: req.body.bene_middlename.toUpperCase(),
        bene_lastname: req.body.bene_lastname.toUpperCase(),
        bene_exname: req.body.bene_exname.toUpperCase()
    })
    if(!isRegistered && !isConfirmed){
        const create = await AICS_Registration(body)
        create.save()
        .then(() => {
            console.log(`${create} is created`)
            res.send('successfully registered')
        })
        .catch(err => {
            console.log(err.message)
        })
    }else{
        res.send('already registered')
    }
}

module.exports.register_emergency_get = (req, res) => {
    res.render('admin/form/emergency_reg_form')
}

module.exports.register_emergency_post = async(req, res) => {
    const body = req.body;
    const isConfirmed = await AICS_Confirmation.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(),
        bene_middlename: req.body.bene_middlename.toUpperCase(),
        bene_lastname: req.body.bene_lastname.toUpperCase(),
        bene_exname: req.body.bene_exname.toUpperCase()
    })
    const isRegistered = await AICS_Registration.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(),
        bene_middlename: req.body.bene_middlename.toUpperCase(),
        bene_lastname: req.body.bene_lastname.toUpperCase(),
        bene_exname: req.body.bene_exname.toUpperCase()
    })
    if(!isRegistered && !isConfirmed){
        const create = await AICS_Registration(body)
        create.save()
        .then(() => {
            console.log(`${create} is created`)
            res.send('successfully registered')
        })
        .catch(err => {
            console.log(err.message)
        })
    }else{
        res.send('already registered')
    }
}

module.exports.register_transportation_get = (req, res) => {
    res.render('admin/form/transportation_reg_form')
}

module.exports.register_transportation_post = async(req, res) => {
    const body = req.body;
    const isConfirmed = await AICS_Confirmation.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(),
        bene_middlename: req.body.bene_middlename.toUpperCase(),
        bene_lastname: req.body.bene_lastname.toUpperCase(),
        bene_exname: req.body.bene_exname.toUpperCase()
    })
    const isRegistered = await AICS_Registration.findOne({
        bene_firstname: req.body.bene_firstname.toUpperCase(),
        bene_middlename: req.body.bene_middlename.toUpperCase(),
        bene_lastname: req.body.bene_lastname.toUpperCase(),
        bene_exname: req.body.bene_exname.toUpperCase()
    })
    if(!isRegistered && !isConfirmed){
        const create = await AICS_Registration(body)
        create.save()
        .then(() => {
            console.log(`${create} is created`)
            res.send('successfully registered')
        })
        .catch(err => {
            console.log(err.message)
        })
    }else{
        res.send('already registered')
    }
}

// records page

module.exports.records_educ_assistance = async(req, res) => {
    const render = await Educ_Record.find({service: 'College Educational Assistance'}).sort({fullname: 1})
    const date = await Educ_Compile.find().sort({createdAt: -1}).populate('date')
    let counter = 0
    render.forEach(count => {
        counter++
    })
    res.render('admin/record/educ_record', {render, date, counter})
}

module.exports.records_compile = async(req, res) => {
    if(await bcrypt.compare(req.body.password, res.locals.user.password)){
        const records = await Educ_Record.find()
        const compile = []
        if(records != ''){
            records.forEach(async(data) => {
                compile.push({
                    service: data.service,
                    firstname: data.firstname,
                    middlename: data.middlename,
                    lastname: data.lastname,
                    exname: data.exname,
                    address: data.r_full_address,
                    contact_number: data.contact_number,
                    email: data.email,
                    parent_name: {
                        mother_name: `${data.mother_fname} ${data.mother_mname} ${data.mother_lname}`,
                        father_name: `${data.father_fname} ${data.father_mname} ${data.father_lname}`
                    },
                    age: data.age,
                    sex: data.sex
                })
                let response = {
                    body: {
                        name: `${data.firstname} ${data.middlename} ${data.lastname}`,
                        intro: `You may claim your cash assistance`,
                    }
                }
                let mail = MailGenerator.generate(response)
                let message = {
                    from: 'support@email.com',
                    to: data.email,
                    subject: 'social service',
                    html: mail
                }
                await transporter.sendMail(message)
                .then((info) => {
                    console.log('email is successfully generated',info.messageId)
                })
                .catch(err => console.log(err.message))
            })
            const create = new Educ_Compile({
                list: compile
            })
            create.save()
            .then(async() => {
                console.log(`${create} is added`)
                await Educ_Record.deleteMany({status: 'completed'})
                await Educ_Confirmation.deleteMany({status: 'appointment'})
            })
        }else{
            console.log('no data to compile')
        }
        console.log('password match')
        res.redirect('/a/records/educational-assistance')
    }else{
        console.log('password doesnt match')
        res.redirect('/a/records/educational-assistance')
    }
}

module.exports.records_educ_list = async(req, res) => {
    try {
        let data = []
        const date = await Educ_Compile.find().sort({createdAt: -1})
        const info = await Educ_Compile.find().sort({createdAt: -1}).populate('list')
        info.forEach(p => {
            p.list.forEach(a => {
                // console.log(a)
                data.push(a)
            })
        })
        console.log(info.length)
        res.render('admin/record/educ_list', {date, data})
    } catch (err) {
        console.log(err.message)
        res.send('err 404')
    }
}

module.exports.records_educ_list_id = async(req, res) => {
    try {
        const id = req.params.id
        const date = await Educ_Compile.find().sort({createdAt: -1})
        const info = await Educ_Compile.findById(id).sort({createdAt: -1})
        res.render('admin/record/educ_selected_list', {date, info})
    } catch (err) {
        console.log(err.message)
        res.send('err 404')
    }
}

module.exports.records_aics_list = async(req, res) => {
    const {month, year} = req.query
    let render;
    if(!month && !year){
        render = await AICS_Compile.find()
    }else{
        let selected_date = new Date(`${year} ${month} 01`)
        let next_date = new Date(selected_date)
        next_date.setMonth(next_date.getMonth() + 1)
        console.log(selected_date, next_date)
        render = await AICS_Compile.find({
            createdAt: {
                $gte: selected_date,
                $lt: next_date
            }
        })
    }
    res.render('admin/record/aics_list', {render})
}

module.exports.records_medical_assistance = async(req, res) => {
    const render = await AICS_Record.find({service: 'Medical Assistance'}).sort({fullname: 1})
    let counter = 0
    render.forEach(count => {
        counter++
    })
    res.render('admin/record/aics_record', {render, counter})
}

module.exports.records_burial_assistance = async(req, res) => {
    const render = await AICS_Record.find({service: 'Burial Assistance'}).sort({fullname: 1})
    let counter = 0
    render.forEach(count => {
        counter++
    })
    res.render('admin/record/aics_record', {render, counter})
}

module.exports.records_transpo_assistance = async(req, res) => {
    const render = await AICS_Record.find({service: 'Transportation Assistance'}).sort({fullname: 1})
    let counter = 0
    render.forEach(count => {
        counter++
    })
    res.render('admin/record/aics_record', {render, counter})
}

module.exports.records_emergency_assistance = async(req, res) => {
    const render = await AICS_Record.find({service: 'Emergency Shelter Assistance'}).sort({fullname: 1})
    let counter = 0
    render.forEach(count => {
        counter++
    })
    res.render('admin/record/aics_record', {render, counter})
}

// account page

module.exports.accounts = async(req, res) => {
    const viewAccounts = await Account.find({accountType: 'staff', isDeleted: false});
    res.render('admin/account', {viewAccounts})
}

module.exports.accounts_enable = async(req, res) => {
    try{
        const id = req.params.id;
        const option = {new: true}
        const update = await Account.findByIdAndUpdate(id, {status: 'active', updatedAt: new Date()}, option)
        console.log(update)
        res.redirect('/a/accounts')
    }catch(err){
        console.log(err.message)
    }
}

module.exports.accounts_disable = async(req, res) => {
    try{
        const id = req.params.id;
        const options = {new: true}
        const update = await Account.findByIdAndUpdate(id, {status: 'inactive', updatedAt: new Date()}, options)
        console.log(update)
        res.redirect('/a/accounts')
    }catch(err){
        console.log(err.message)
    }
}

module.exports.archive_account = async(req, res) => {
    const viewAccounts = await Account.find({accountType: 'staff', isDeleted: true});
    res.render('admin/account_archive', {viewAccounts})
}

module.exports.accounts_archive = async(req, res) => {
    try{
        const id = req.params.id;
        const options = {new: true}
        const update = await Account.findByIdAndUpdate(id, {isDeleted: true, updatedAt: new Date()}, options)
        res.redirect('/a/accounts')
    }catch(err){
        console.log(err.message)
    }
}

module.exports.accounts_restore = async(req, res) => {
    try{
        const id = req.params.id;
        const options = {new: true}
        const update = await Account.findByIdAndUpdate(id, {isDeleted: false, updatedAt: new Date()}, options)
        res.redirect('/a/account-archive')
    }catch(err){
        console.log(err.message)
    }
}

module.exports.accounts_delete = async(req, res) => {
    try{
        const id = req.params.id;
        const deleted = await Account.findByIdAndDelete(id)
        console.log(deleted, 'is deleted')
        res.redirect('/a/accounts')
    }catch(err){
        console.log(err.message)
    }
}

module.exports.create_account_get = (req, res) => {
    res.render('admin/create_account')
}

module.exports.create_account_post = async(req, res) => {
    const {firstname, middlename, lastname, contact, email, password} = req.body;
    const create = await Account({
        firstname,
        middlename,
        lastname,
        contact,
        email,
        password,
        accountType: 'staff',
        name: 'dp.png',
        image: {
            data: '',
            contentType: 'image/png',
        }
    })
    create.save()
    .then(() => {
        console.log(`${create} is created`)
        res.redirect('/a/accounts');
    })
    .catch(err => {
        console.log(err.message)
        res.redirect('/a/create-account');
    })
}

// account page

// account setting page

module.exports.settings = (req, res) => {
    res.render('admin/account_settings')
}

module.exports.settings_id = async(req, res) => {
    try{
        const id = req.params.id;
        const option = { new: true };
        const image = await Account.findByIdAndUpdate(id, {
            img_name: req.file.filename,
            image: {
                data: fs.readFileSync('uploads/' + req.file.filename),
                contentType: 'image/png'
            }
        }, option);
        console.log(image);
        res.redirect('/a/settings');
    }catch(err){
        console.log(err.message)
        res.send('error')
    }
}

// account setting page

module.exports.search_appointment = async(req, res) => {
    let opt = await Option.findOne()
    opt = opt.option
    try{
        let searchField = (req.query.result).split('-').join('');
        // searchField = searchField.split('-').join('');
        searchField = searchField.toUpperCase()
        const find = await Educ_Appointment.find(
            {
                $or: [
                    {reference: {$regex: searchField}},
                    {fullname: {$regex: searchField}}
                ]
            }
        )
        console.log(find)
        res.render('admin/appointment_search', {find, opt})
    }
    catch(err){
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}

module.exports.search_application = async(req, res) => {
    try{
        let searchField = (req.query.result).split('-').join('');
        searchField = searchField.toUpperCase();
        console.log(searchField)
        let find = await Educ_Registration.find(
            {
                $or: [
                    {reference: {$regex: searchField}},
                    {bene_lastname: {$regex: searchField}},
                    {bene_firstname: {$regex: searchField}},
                ]
            }
        )
        if(find == false){
            console.log('not found')
            find = await AICS_Registration.find(
                {
                    $or: [
                        {reference: {$regex: searchField}},
                        {bene_lastname: {$regex: searchField}},
                        {bene_firstname: {$regex: searchField}},
                    ]
                }
            )
            if(find == false){
                console.log('again! not found')
            }
        }else{
            console.log(find)
        }
        res.render('admin/application_search', {find})
    }
    catch(err){
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
}