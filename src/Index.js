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


app.listen(port, () => {
  console.log(`Server started on port ${port}`)
})