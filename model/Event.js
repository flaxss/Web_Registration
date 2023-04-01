const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    quota: {
        type: Number,
    },
    event_date: {
        type: String
    },
    remarks: {
        type: String,
        default: 'None',
    },
    nonFormat: {
        type: Date,
        default: function(){
            return new Date(this.event_date)
        }
    }
});

const Event = mongoose.model('Event', eventSchema)
module.exports = Event;