const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const Account = require('../model/Account')

// import secret
dotenv.config({path: 'config.env'});
const secret = process.env.SECRET_KEY;
// import secret

// system_admin

const sysAuth = (req, res, next) => {
    const token = req.cookies.sys_id;
    if(token){
        next()
    }else{
        res.redirect('/sys-login');
    }
}

// authenticate admin and staff
const requireAuth = (req, res, next) => {
    const token = req.cookies.admin_id;
    // check if token exist
    if(token){
        jwt.verify(token, secret, async(err, decodedToken) => {
            if(err) {
                console.log(err.message);
                res.redirect('/tmc-login')
            }else{
                const account = await Account.findById(decodedToken.id)
                if(account == null){
                    res.redirect('/tmc-login')
                }else{
                    if(account.isDeleted == true){
                        res.cookie('admin_id', '', {maxAge: 1})
                        console.log('logout successfully')
                        return res.redirect('/tmc-login')
                    }
                    if(account.accountType == 'staff' && account.status == 'inactive'){
                        res.cookie('admin_id', '', {maxAge: 1})
                        console.log('logout successfully')
                        return res.redirect('/tmc-login')
                    }
                    next();
                }
            }
        })
    }else{
        res.redirect('/tmc-login');
    }
}

// save user on session
const checkUser = (req, res, next) => {
    const token = req.cookies.admin_id;
    // check if token exist
    if(token){
        jwt.verify(token, secret, async (err, decodedToken) => {
            if(err) {
                console.log(err.message);
                res.locals.user = null;
                next();
            }else{
                let user = await Account.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        })
    }else{
        res.redirect('/tmc-login');
    }
}

const Option = require('../model/Option')
const Event = require('../model/Event')

const isActivate = async(req, res, next) => {
    const opt = await Option.findOne()
    // if(opt.option == 'activate'){
    //     next()
    // }else{
    //     res.render('user/educ/unavailable_page')
    // }
    const event = await Event.find()
    // if event is empty deactivate option
    if(event == ''){
        const options = {new: true}
        await Option.updateOne({option: 'activate'}, {option: 'deactivate'}, options)
    }
    if(event != '' && opt.option === 'activate'){
        next()
    }else{
        res.render('user/educ/unavailable_page')
    }
}

module.exports = { sysAuth, requireAuth, checkUser, isActivate }