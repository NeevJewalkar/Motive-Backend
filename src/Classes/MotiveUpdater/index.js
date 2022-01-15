const client = require('mongodb').MongoClient

/*

    Info Should contain:
        - Timestamp
        - Text

    Info will have a unique ID given to it by the Backend

*/

class updateHandler {
    constructor() {

    }

    GenId = () => {
        let id = Date.now() * (Math.floor(Math.random() * 100) + 1)
        return id
    }

    addUpdate = (mId, url, info, cb) => {

        client.connect(url, (err, db) => {
            if (err) throw err;

            let dbo = db.db('Motive')
            let collection = dbo.collection('motives')

            collection.find({ ID: parseInt(mId) }).toArray((err, docs) => {
                if (err) {
                    console.log(err)
                    cb(err)
                }

                let motive = docs[0]

                console.log(JSON.parse(info))
                let info2 = JSON.parse(info)
                info2.ID = this.GenId()

                collection.updateOne({ ID: parseInt(mId) }, { $push: { Updates: info2 } }, (err, result) => {
                    if (err) {
                        console.log(err)
                        cb(err)
                    }

                    cb('success')
                })
            })
        })

    }

    getUpdates = (mId, url, cb) => {
            
        client.connect(url, (err, db) => {
            if (err) throw err;

            let dbo = db.db('Motive')
            let collection = dbo.collection('motives')

            collection.find({ ID: parseInt(mId) }).toArray((err, docs) => {
                if (err) {
                    console.log(err)
                    cb(err)
                }

                let motive = docs[0]

                cb(motive.Updates)
            })
        })
    
    }

}

module.exports = updateHandler