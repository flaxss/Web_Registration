const express = require('express');
const methodOverride = require('method-override')
const dotenv = require('dotenv');
const app = express();
const cors = require('cors')
const path = require('path');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

// credentials
dotenv.config({path: 'config.env'});
const PORT = process.env.PORT || 8080;
// -- credentials --

const AICS_Record = require('./model/AICS_Record')
const Option = require('./model/Option');

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

// auto-create option 
async function option(){
    const option = await Option.find()
    if(option == ''){
        const isActivte = await Option({
            option: 'activate'
        })
        isActivte.save()
        .then(() => console.log(`${isActivte}`,'created'))
        .catch(err => console.log(err.message))
    }
}

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect('mongodb://localhost:27017/cswdo_db')
//         console.log(`Successfully Connected To The Database ${conn.connection.host}`)
//         console.log(`Successfully Connected To The Database`)
//         expiryDate()
//         option()
//     } catch (err) {
//         console.log(err.message)
//         process.exit(1)
//     }
// }
// connectDB()
// .then(() => {
//     app.listen(PORT, () => {
//         console.log(`The server is running on http://localhost:${PORT}`);
//     })
// })


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Successfully Connected To The Database ${conn.connection.host}`)
        console.log(`Successfully Connected To The Database`)
        expiryDate()
        option()
    } catch (err) {
        console.log(err.message)
        process.exit(1)
    }
}
connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`The server is running on http://localhost:${PORT}`);
    })
})


// parse request
app.use(express.urlencoded({extended: false}));
// -- parse request --

app.use(cors())

// override post method to PUT, PATCH, DELETE method
app.use(methodOverride('_method'));

// set view engine 'ejs', 'html', etc..
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// load assets CSS, IMG, JS
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'uploads')));

// routes

const adminRoute = require('./router/Admin_Route')
const userRoute = require('./router/User_Route')
const authRoute = require('./router/Auth_Route')
const sysRoute = require('./router/System_Admin')

// system login
app.use('/', sysRoute)

// auth route
app.use('/', authRoute);

// admin route
app.use('/a', adminRoute);

// user route
app.use('/', userRoute);

//not found
app.get('/*', (req, res) => {
    res.status(404).render('err/notfound')
});

