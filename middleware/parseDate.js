const moment = require('moment')

const dateFormat = (date) => {
    let day = moment(date).format('DD')
    let month = moment(date).format('MM')
    let year = moment(date).format('YYYY')
    let formatted = `${year}-${month}-${day}`
    // console.log(formatted)
    return formatted;
}

module.exports = {dateFormat}