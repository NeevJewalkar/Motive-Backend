/*

Mail Handler:
    - Refresh Emails
    - Send Email to all users
    - Send Email to Motive Creater whenever a new user has been added to the motive

*/

const client = require('mongodb').MongoClient
const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'neobo4i@gmail.com',
      pass: 'Nj#123123'
    }
});

class mailHandler {
    constructor() {

        this.emails = [];
        this.usernames = [];
        this.pledges = [];

        this.makermail = ''
        this.makername = '';

        this.options = '';
        
    }



    sendEmailFinish = (mId, url) => {


        let i = 0
        let emails = []
        let usernames = []
        let pledges = []
        let makername = ''
        let makermail = ''

        this.getMotiveInfo(mId, url, result => {

            emails = result.emails
            usernames = result.names
            pledges = result.pledges
            makername = result.makername
            makermail = result.makermail

            emails.forEach(email => {

                let mailOptions = {
                    from: 'neobo4i@gmail.com',
                    to: email,
                    subject: 'Hey ' + usernames[i] + '! One of your Pledge Motives has been finished!',
                    text: 'Hey there! Looks like one of the motives that you have pledged is finished, The maker did its job, so should you! \n You can check out the motive here: http://192.168.29.68:8028/motive/' + mId
                }

                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) throw err;
                    console.log('Email sent: ' + info.response);
                })

                i++

            })

        })

    }


    sendEmailUpdate = (mId, url, update) => {


        let i = 0
        let emails = []
        let usernames = []
        let pledges = []
        let makername = ''
        let makermail = ''

        this.getMotiveInfo(mId, url, result => {

            emails = result.emails
            usernames = result.names
            pledges = result.pledges
            makername = result.makername
            makermail = result.makermail

            emails.forEach(email => {

                let mailOptions = {
                    from: 'neobo4i@gmail.com',
                    to: email,
                    subject: 'Hey ' + usernames[i] + '! One of your Pledge Motives has been updated!',
                    text: 'Hey there! Looks like one of the motives that you have pledged has been updated \n You can check out the motive here: http://192.168.29.68:8028/motive/' + mId
                }

                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) throw err;
                    console.log('Email sent: ' + info.response);
                })

                i++
            })
        })
    }

    sendEmailContact = (mId, url, contact) => {

        let makername = ''
        let makermail = ''

        this.getMotiveInfo(mId, url, result => {

            makername = result.makername
            makermail = result.makermail

            let mailOptions = {
                from: 'neobo4i@gmail.com',
                to: makermail,
                subject: 'Hey ' + makername + '! Someone has pledged your motive',
                text: 'Hey there! Looks like someone has pledged your motive, check it out here: http://192.168.29.68:8028/motive/' + mId
            }

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) throw err;
                console.log('Email sent: ' + info.response);
            })

        })

    }

    newUser = (name, email) => {
            
            let mailOptions = {
                from: 'neobo4i@gmail.com',
                to : email,
                subject: 'Hey ' + name + '! Welcoome to Motive!',
                text: 'Hey there! Welcome to Motive! Go ahead and create a new motive here: http://192.168.29.68:8028'
            }

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) throw err;
                console.log('Email sent: ' + info.response);
            })
    }

    getMotiveInfo = (mId, url, callback) => {

        // expected to get ~emails usernames pledges and maker username and email~

        client.connect(url, (err, db) => {
            if (err) throw err;
            let dbo = db.db('Motive');
            dbo.collection('motives').findOne({ID: parseInt(mId)}, (err, result) => {
                if (err) throw err;


                let contacts = result.Contacts

                contacts.forEach(contact => {
                    this.emails.push(contact.Email)
                    this.usernames.push(contact.Name)
                    this.pledges.push(contact.PledgedAmount)
                })

                dbo.collection('users').findOne({Name: result.Name}, (err, resu) => {
                    if (err) throw err;
                    
                    this.makername = resu.Name
                    this.makermail = resu.Email

                    callback({ emails: this.emails, names: this.usernames, pledges: this.pledges, makername: this.makername, makermail: this.makermail })

                })

            })
        })
    }
}

module.exports = mailHandler;

