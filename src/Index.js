require('dotenv').config()
const client = require('mongodb').MongoClient
const express = require('express')

let app = express()
let url = process.env.DB_URL
let port = process.env.PORT || 3000


/* API functions */

app.post('/get', (req, res) => {
    client.connect(process.env.DB_URL, (err, db) => {
        if (err) throw err;

        let dbo = db.db('Motive')
        let collection = dbo.collection('motives')

        console.log(req.get('Name'))

        collection.find({ Name: req.get('Name') }).toArray((err, docs) => {
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
                })
            })

            res.json(MotiveInfo)
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
            Username: req.get('Username'),
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
                break;
            } else {
                res.json({ Email: docs[0].Email })
            }
        })
    })
})


app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})