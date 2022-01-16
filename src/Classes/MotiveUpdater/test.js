const updateHandler = require('./index')

const uHandler = new updateHandler()

uHandler.addComment("101779949637288", 'mongodb://127.0.0.1:27017/', 'neevcuber', 'hi', '4926496447209', (res) => {
    console.log(res)
})

/* uHandler.addUpdate( "101779949637288", 'mongodb://127.0.0.1:27017/', { timestamp: Date.now(), text: 'hello, world!' } ,res => {
    console.log(res)
    uHandler.getUpdates( "101779949637288", 'mongodb://127.0.0.1:27017/', upd => {
        console.log(upd)
    })
}) */