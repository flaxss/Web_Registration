const express = require('express')
const router = express.Router();
const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');

// credenials
dotenv.config({path: 'config.env'});
const USERNAME = process.env.ADMIN;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const secret = process.env.SECRET_KEY;

const Account = require('../model/Account');

const {sysAuth} = require('../middleware/auth')

const cookieParser = require('cookie-parser');
router.use(cookieParser());

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({id}, secret, {
        expiresIn: maxAge
    });
}

router.route('/sys-login')
.get((req, res) => {
    res.render('sys_login')
})
.post((req, res) => {
    const {username, password} = req.body;
    if(username == USERNAME){
        if(password == ADMIN_PASSWORD){
            console.log('success systam-admin login');
            const token = createToken(123456789);
            res.cookie('sys_id', token, { httpOnly: true, secure: true, maxAge: maxAge * 1000 })
            res.redirect('/dashboard')
        }else{
            console.log('wrong password');
            res.redirect('/sys-login')
        }
    }else{
        console.log('wrong username');
        res.redirect('/sys-login')
    }
})

router.route('/dashboard')
.get(sysAuth, async(req, res) => {
    const accounts = await Account.find()
    res.render('sys_admin/dashboard', {accounts})
})

router.route('/create-account')
.post(async(req, res) => {
    const  {firstname, middlename, lastname, contact, email, password, accountType} = req.body;
    const hashed = await bcrypt.hash(password, 10)
    const create = await Account({
        firstname,
        middlename,
        lastname,
        contact,
        email,
        password: hashed,
        accountType,
    })
    create.save()
    .then(() => console.log(create))
    .catch(err => console.log(err.message))
    res.redirect('/dashboard')
})

router.delete('/delete-account/:id', async(req, res) => {
    const isFind = await Account.findByIdAndDelete(req.params.id)
    res.redirect('/dashboard')
})

router.route('/sys-logout')
.post((req, res) => {
    res.cookie('sys_id', '', {maxAge: 1})
    console.log('logout successfully')
    res.redirect('/sys-login')
})

module.exports = router;