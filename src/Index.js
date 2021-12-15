require('dotenv').config()
const client = require('mongodb').MongoClient
const express = require('express')

let app = express()
let url = process.env.DB_URL
let port = process.env.PORT || 3000


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
                    id: doc.ID
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
                    Contacts: []
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
                res.json({
                    Motive: {
                        title: doc.Motive.Title,
                        description: doc.Motive.Description,
                        deadline: doc.Motive.Deadline,
                        amount: doc.Motive.Amount,
                    },
                    creater: doc.Name === req.get('Username'),
                    pledged: doc.Contacts.includes({ Name: req.get('Username') }),
                    Contacts: doc.Contacts
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
        })
    })
})

app.post('/user/get/', (req, res) => {
    client.connect(process.env.DB_URL, (err, db) => {
        if (err) throw err;

        let dbo = db.db('Motive')
        let collection = dbo.collection('users')

        collection.find({ Username: req.get('Username'), Password: req.get('Password') }).toArray((err, docs) => {
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

/* Acess Functions */

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