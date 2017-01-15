'use strict'

const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const Rx = require('rx')

const port = 3000

app.use(express.static('public'))

server.listen(port, function () {
  console.log(`Server started in port ${port}`)
})

const client$ = Rx.Observable.create((observer) => {
  io.on('connection', (client) => observer.onNext(client))
})

const clientMovePointer$ = client$
  .flatMap((client) => Rx.Observable.create(
    (observer) => client.on('pointer-move', observer.onNext.bind(observer)))
  )

clientMovePointer$.subscribe(
  (data) => console.log(data.username, data)
)

// client$.subscribe(
//   (client) => {
//     client.on('pointer-move', (data) => {
//       console.log(data)
//       io.sockets.emit('response', 'it works....')
//     })
//   }
// )
