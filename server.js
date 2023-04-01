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

// -- connect to database --
const mongoUri = `mongodb://localhost:27017/cswdo_db`
mongoose.connect(mongoUri)
    .then((result) => {
        console.log('Successfully Connected To The Database');
        app.listen(PORT, () => {
            console.log(`The server is running on http://localhost:${PORT}`);
        })
    })
    .catch((err) => console.log(err));
// -- connect to database --

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGO_URI)
//         // console.log(`Successfully Connected To The Database ${conn.connection.host}`)
//         console.log(`Successfully Connected To The Database`)
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

