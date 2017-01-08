/* global io */
(() => {
  'use strict'

  const socket = io.connect('http://localhost:3000')
  socket.on('news', function (data) {
    console.log(data)
  })
})()
