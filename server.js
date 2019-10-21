const path = require('path')
const jsMini = require('jsonapi-server-mini')
const mongoUri = 'mongodb://localhost:27017/test'
const routes = path.join(__dirname, 'server')

jsMini({
    routes, mongoUri
})
