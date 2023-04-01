const mongoose = require('mongoose');
const accountSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        uppercase: true
    },
    middlename: {
        type: String,
        required: true,
        uppercase: true
    },
    lastname: {
        type: String,
        required: true,
        uppercase: true
    },
    contact: {
        type: String,
        required: true
        
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimum password length is 6 characters']
    },
    accountType: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'active'
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    updatedAt: {
        type: Date,
        default: new Date(),
    },
    img_name: {
        type: String,
        default: 'dp.png'
    },
    image: {
        data: Buffer,
        contentType: String,
    }
});

const Account = mongoose.model('Account', accountSchema)
module.exports = Account;

const bcrypt = require('bcrypt')
// create documents
async function createSchema () {
    const hashed = await bcrypt.hash('password', 10)
    const create = await new Account({
        firstname: 'jeff',
        middlename: 'molato',
        lastname: 'regencia',
        contact: '09215534301',
        email: 'regencia011@gmail.com',
        password: hashed,
        accountType: 'admin',
        img_name: 'dp.png',
    })
    create.save()
    .then(res => {
        console.log(create)
    })
    .catch(err => console.log(err))
}
// createSchema();

// show all the documents
// async function showAll () {
//     const info = await Account.find({});
//     info.forEach(res => {
//         console.log(res);
//     })
    
// }
// showAll();
