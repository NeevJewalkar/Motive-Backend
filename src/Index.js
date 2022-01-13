require('dotenv').config()
const client = require('mongodb').MongoClient
const express = require('express')
const mailHandler = require('./Classes/EmailHandler/index.js')

let mhandler = new mailHandler()
let app = express()
let url = process.env.DB_URL
console.log(url)
let port = process.env.PORT || 3000
let pledged = false

/* API functions */

app.post('/motives/get', (req, res) => {
    client.connect(process.env.DB_URL, (err, db) => {
        if (err) throw err;

        let dbo = db.db('Motive')
        let collection = dbo.collection('motives')

        console.log(req.get('Name'))

        collection.find({ Name: req.get('Username') }).toArray((err, docs) => {
            if (err) {
                console.log(err)
                res.send(err)
            }

            let MotiveInfo = []

            console.log(err)

            docs.forEach(doc => {
                console.log(doc)
                MotiveInfo.push({
                    title: doc.Motive.Title,
                    description: doc.Motive.Description,
                    deadline: doc.Motive.Deadline,
                    amount: doc.Motive.Amount,
                    id: doc.ID,
                    finished: doc.Finished
                })
            })

            res.json(MotiveInfo)
        })
    })
})

app.post('/motives/create', (req, res) => {
    client.connect(process.env.DB_URL, (err, db) => {
        if (err) throw err;

        let dbo = db.db('Motive')
        let collection = dbo.collection('motives')

        CheckIfExists(req.get('Username'), req.get('Email'), (exists) => {
            console.log(exists)
            if (exists) {
                collection.insertOne({
                    Name: req.get('Username'),
                    ID: GenId(),
                    Motive: {
                        Title: req.get('Title'),
                        Description: req.get('Description'),
                        Deadline: req.get('Deadline'),
                        Amount: req.get('Amount'),
                    },
                    Contacts: [],
                    Finished: false
                }, (err, result) => {
                    if (err) throw err;

                    res.json({ message: "Created Motive" })

                    console.log('Motive created')
                })
            } else {
                res.json({ message: "User does not exist" })
            }
        })
        
    })
})

app.post('/motives/contacts/add', (req, res) => {
    client.connect(process.env.DB_URL, (err, db) => {
        if (err) throw err;

        let dbo = db.db('Motive')
        let collection = dbo.collection('motives')

        let newContact = {
            Name: req.get('Name'),
            Email: req.get('Email'),
            PledgedAmount: req.get('Amount'),
        }

        collection.updateOne({ ID: parseInt(req.get('ID')) }, { $push: { Contacts: newContact } }, (err, result) => {
            if (err) throw err;

            res.json({ message: "Added contact" })
            mhandler.sendEmailContact(req.get('ID'), process.env.DB_URL)
        })
    })
})

app.post('/motives/contacts/remove', (req, res) => {
    client.connect(process.env.DB_URL, (err, db) => {
        if (err) throw err;

        let dbo = db.db('Motive')
        let collection = dbo.collection('motives')

        collection.updateOne({ ID: parseInt(req.get('ID')) }, { $pull: { Contacts: { Name: req.get('Name') } } }, (err, result) => {
            if (err) throw err;

            res.json({ message: "Removed contact" })
            pledged = false
        })
    })
})

app.post('/motives/finish', (req, res) => {
    client.connect(process.env.DB_URL, (err, db) => {
        if (err) throw err;

        let dbo = db.db('Motive')
        let collection = dbo.collection('motives')

        collection.updateOne({ ID: parseInt(req.get('ID')) }, { $set: { Finished: req.get('value').toLowerCase() == 'true' } }, (err, result) => {
            if (err) throw err;

            res.json({ message: "Changed Motive" })
            mhandler.sendEmailFinish(req.get('ID'), process.env.DB_URL)
        })
    })
})

app.post('/motives/id/get', (req, res) => {
    client.connect(process.env.DB_URL, (err, db) => {
        if (err) throw err;

        let dbo = db.db('Motive')
        let collection = dbo.collection('motives')

        collection.findOne({ ID: parseInt(req.get('ID')) }, (err, doc) => {
            if (err) throw err;

            console.log(doc)

            if (doc !== null) {
                console.log('Username: ' + req.get('Username'))
                console.log(doc.Contacts.includes({ Name: req.get('Username') }))
                for (let i = 0; i < doc.Contacts.length; i++) {
                    if (doc.Contacts[i].Name === req.get('Username')) {
                        pledged = true
                    } else {
                        pledged = false
                    }
                }
                console.log(pledged)
                console.log(doc.Contacts)
                res.json({
                    Motive: {
                        title: doc.Motive.Title,
                        description: doc.Motive.Description,
                        deadline: doc.Motive.Deadline,
                        amount: doc.Motive.Amount,
                    },
                    creater: doc.Name === req.get('Username'),
                    pledged: pledged,
                    Contacts: doc.Contacts,
                    Finished: doc.Finished
                })
            } else {
                res.json({ message: "Motive does not exist" })
            }
        })
    })
})

/* User API functions */

app.post('/user/create', (req, res) => {
    client.connect(process.env.DB_URL, (err, db) => {
        if (err) throw err;

        let dbo = db.db('Motive')
        let collection = dbo.collection('users')

        let newUser = {
            Name: req.get('Username'),
            Password: req.get('Password'),
            Email: req.get('Email'),
        }

        collection.insertOne(newUser, (err, result) => {
            if (err) {
                console.log(err)
                res.send(err)
            }
            res.send(result)
            mhandler.newUser(req.get('Username'), req.get('Email'))
        })
    })
})

app.post('/user/get/', (req, res) => {
    client.connect(process.env.DB_URL, (err, db) => {
        if (err) throw err;

        let dbo = db.db('Motive')
        let collection = dbo.collection('users')

        collection.find({ Name: req.get('Username'), Password: req.get('Password') }).toArray((err, docs) => {
            if (err) throw err;

            if (docs[0] === undefined) {
                res.json({ Message: 'User or Password is Invalid' })
                return;
            } else {
                res.json({ Email: docs[0].Email })
            }
        })
    })
})


app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})

/* Access Functions */

let CheckIfExists = (Username, Email, cb) => {
    client.connect(process.env.DB_URL, (err, db) => {
        if (err) throw err;

        let dbo = db.db('Motive')
        let collection = dbo.collection('users')

        collection.findOne({ Name: Username, Email: Email}, (err ,doc) => {
            if (err) throw err;

            console.log(doc)

            let exists;

            if (doc !== null) {
                exists = doc.Name === Username && doc.Email === Email

            } else {
                exists = false

            }

            cb(exists)

        })
        console.log('disconnecting form collection')
    })
    console.log('disconnecting form client')
}

let GenId = () => {
    let id = Date.now() * (Math.floor(Math.random() * 100) + 1)
    return id
}