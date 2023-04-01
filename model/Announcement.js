const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    header: {
        type: String,
    },
    post: {
        type: String,
    },
    author: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    },
    editor: {
        type: String,
        default: 'n/a'
    }
});

const Announcement = mongoose.model('Announcement', announcementSchema)
module.exports = Announcement;

async function add(){
    const create = await Announcement({
        header: 'head',
        post: 'post',
        author: 'author',
    })
    create.save()
    .then(() => {
        console.log(create)
    })
    .catch(err => {
        console.log(err.message)
    })
}
// add()