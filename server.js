'use strict'

const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const port = 3000

app.use(express.static('public'))

io.on('connection', function onIOConnection (socket) {
  socket.emit('news', { hello: 'world' })
  socket.on('my-other-event', (data) => console.log(data))
})

server.listen(port, function () {
  console.log(`Server started in port ${port}`)
})
