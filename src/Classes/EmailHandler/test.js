require('dotenv').config()
const mailHandler = require('./index.js')

let mhandler = new mailHandler()

mhandler.getMotiveInfo('19682326715988', 'mongodb://localhost:27017/', (result) => {
    console.log(result)
})

mhandler.sendEmailFinish('19682326715988', 'mongodb://localhost:27017/')
mhandler.sendEmailUpdate('19682326715988', 'mongodb://localhost:27017/')
mhandler.sendEmailContact('19682326715988', 'mongodb://localhost:27017/')

/*
mhandler.sendEmailFinish('160739053170584', 'mongodb://localhost:27017/Motive')
mhandler.sendEmailUpdate('160739053170584', 'mongodb://localhost:27017/Motive')
mhandler.sendEmailContact('160739053170584', 'mongodb://localhost:27017/Motive', '', { email: 'neevkar@gmail.com', username: 'neevcuber' })
*/