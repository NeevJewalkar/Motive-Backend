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
                info2.Comments = []

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

    addComment = (mId, url, user, content, Id, cb) => {
            
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

                    this.getUpdates(mId, url, res => {

                        let updates = res.Updates
                        let index = 0

                        console.log(updates)

                        for (let i = 0; i < updates.length; i++) {
                            if (updates[i].ID === parseInt(Id)) {
                                updates[i].Comments.push({
                                    User: user,
                                    Content: content
                                })
                            }
                        }
    
                        collection.updateOne({ ID: parseInt(mId) }, { $set: { Updates: updates } }, (err, result) => {
                            if (err) {
                                console.log(err)
                                cb(err)
                            }

                            console.log(result)
        
                            cb('success')
                        })

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

                cb({ Updates: motive.Updates, Creater: motive.Name })
            })
        })
    
    }

    getUpdate = (mId, uId, url, cb) => {

        client.connect(url, (err, db) => {
            if (err) throw er;;

            let dbo = db.db('Motive')
            let collection = dbo.collection('motives')

            collection.find({ ID: parseInt(mId) }).toArray((err, arr) => {

                console.log(arr[0].Updates)

                let updates = arr[0].Updates


                for (let i = 0; i < updates.length; i++) {
                    if (updates[i].ID === parseInt(uId)) {
                        cb({ Update: updates[i] })
                    }
                }

            })
        })

    }

}

module.exports = updateHandler