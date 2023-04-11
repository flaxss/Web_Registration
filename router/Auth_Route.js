const express = require('express')
const router = express.Router();
const bcrypt = require('bcrypt')
const otpGen = require('otp-generator')

const Account = require('../model/Account')

const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');

dotenv.config({path: 'config.env'});
const secret = process.env.SECRET_KEY;

// const maxAge = 3 * 24 * 60 * 60; // 3 days
const maxAge = 24 * 60 * 60; // 1 days
// const maxAge = 60 * 60; //1 hour
// const maxAge = 1 * 60; // 1 minute
const createToken = (id) => {
    return jwt.sign({id}, secret, {
        expiresIn: maxAge
    });
}

let result = {
    success: '',
    message: '',
}

router.route('/tmc-login')
.get((req, res) => {
    res.render('login', {success: result.success, message: result.message})
})
.post(async(req, res) => {
    result = {
        success: '',
        message: '',
    }
    const {email, password} = req.body;
    const find = await Account.findOne({email, isDeleted: false})
    if(find){
        if(await bcrypt.compare(password, find.password)){
            if(find.status != 'inactive'){
                const token = createToken(find._id)
                res.cookie('admin_id', token, { httpOnly: true, secure: true, maxAge: maxAge * 1000 })
                // console.log('login successfully')
                result = {success: true, message: 'login successfully'}
                return res.redirect('/a');
            }else{
                // console.log('the account is disable')
                result = {success: false, message: 'the account is disable'}
                return res.redirect('/tmc-login');
            }
        }else{
            // console.log('wrong password')
            result = {success: false, message: 'wrong password'}
            res.redirect('/tmc-login');
        }
    }else{
        // console.log('account not found');
        result = {success: false, message: 'account not found'}
        return res.redirect('/tmc-login');
    }
})

const Mailgen = require('mailgen')
const nodemailer = require('nodemailer')

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

router.route('/password-reset')
.get((req, res) => {
    res.render('reset')
})
.post(async(req, res) => {
    const user = await Account.findOne({email: req.body.email})
    if(user == null){
        console.log('not found')
        res.redirect('/password-reset')
    }else{
        // generate OTP
        const otp = otpGen.generate(6, { upperCaseAlphabets: false, specialChars: false })
        let response = {
            body: {
                name: `${user.firstname.toUpperCase()} ${user.middlename.toUpperCase()} ${user.lastname.toUpperCase()}`,
                intro: `Here is your OTP <b>${otp}</b>`,
            }
        }
        let mail = MailGenerator.generate(response)
            let message = {
                from: 'support@email.com',
                to: user.email,
                subject: 'password reset',
                html: mail
            }
            await transporter.sendMail(message)
            .then((info) => {
                console.log('email is successfully generated',info.messageId)
            })
        
        const generateToken = (id) => {
            return jwt.sign({id}, otp, {
                expiresIn: 60 * 1000
            });
        }
        const token = generateToken(user.id)
        res.cookie('p_res', token, { httpOnly: true, secure: true, maxAge: 60 * 1000 })

        res.redirect(`/send-otp/${user.id}`)
    }
})

router.route('/send-otp/:id')
.get(async(req, res) => {
    const id = req.params.id
    try {
        const token = req.cookies.p_res;
        if(token){
            const user = await Account.findById(id)
            return res.render('otp/send_otp', {user})
        }else{
            console.log('the token has expired')
            return res.redirect('/password-reset')
        }
    }catch(err){
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
})
.post(async(req, res) => {
    const otp = req.body.otp
    const token = req.cookies.p_res;
    if(token){
        jwt.verify(token, otp, async(err, decodedToken) => {
            if(err){
                console.log(err.message);
                res.redirect('/password-reset')
            }else{
                const user = await Account.findById(decodedToken.id)
                if(user == null){
                    return res.redirect('/password-reset')
                }else{
                    return res.redirect(`/reset/${user.id}`)
                }
            }
        })
    }
    else{
        res.send('the token expires')
    }
})

router.route('/reset/:id')
.get(async(req, res) => {
    const id = req.params.id
    try {
        const token = req.cookies.p_res;
        if(token){
            const user = await Account.findById(id)
            return res.render('otp/reset_form', {user})
        }else{
            console.log('the token has expired')
            return res.redirect('/password-reset')
        }
        
    } catch (err) {
        console.log(err.message)
        res.status(404).render('err/notfound')
    }
})
.post(async(req, res) => {
    const id = req.params.id
    const {new_password} = req.body
    const hashed = await bcrypt.hash(new_password, 10)
    await Account.findByIdAndUpdate(id, {password: hashed}, {new: true})
    res.redirect('/tmc-login')
})

router.post('/logout', (req, res) => {
    res.cookie('admin_id', '', {maxAge: 1})
    console.log('logout successfully')
    res.redirect('/tmc-login')
})

module.exports = router;