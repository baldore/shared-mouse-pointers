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
  .flatMap((client) => Rx.Observable.create((observer) =>
    client.on('pointer-move', (pointerData) => {
      const action = { type: 'POINTER_MOVE', pointerData }
      observer.onNext(action)
    }))
  )

const clientDisconnects$ = client$
  .flatMap((client) => Rx.Observable.create((observer) =>
    client.on('disconnect', () => {
      const action = { type: 'USER_DISCONNECTED', id: client.id }
      observer.onNext(action)
    }))
  )

// Since it's not being managed with immutable structures, it looks ugly, but it works :)
const stateManager$ =
  Rx.Observable.merge(
    clientMovePointer$,
    clientDisconnects$
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
