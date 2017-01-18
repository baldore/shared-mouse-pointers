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

const clientConnected$ = Rx.Observable.fromEvent(io, 'connection')

const clientMovePointer$ = clientConnected$
  .flatMap((client) => Rx.Observable.fromEvent(client, 'pointer-move'))
  .map((pointerData) => ({
    type: 'POINTER_MOVE',
    pointerData
  }))

const clientDisconnected$ = clientConnected$
  .flatMap((client) =>
    Rx.Observable.fromEvent(client, 'disconnect')
      .map((client) => ({
        type: 'USER_DISCONNECTED',
        id: client.id
      }))
  )

// Since it's not being managed with immutable structures, it looks ugly, but it works :)
const stateManager$ =
  Rx.Observable.merge(
    clientMovePointer$,
    clientDisconnected$
  )
  .scan(function dirtyReducer (acc, action) {
    switch (action.type) {
      case 'POINTER_MOVE':
        acc[action.pointerData.id] = action.pointerData
        break

      case 'USER_DISCONNECTED':
        delete acc[action.id]
        break
    }

    return acc
  }, {})

stateManager$.subscribe(
  (pointersData) => io.sockets.emit('pointers-update', pointersData)
)
