const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    option: {
        type: String,
        required: true,
        default: 'activate'
    }
});

const Option = mongoose.model('Option', optionSchema)
module.exports = Option;