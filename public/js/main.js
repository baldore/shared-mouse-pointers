/* global io */
(() => {
  'use strict'

  const socket = io.connect('http://localhost:3000')

  socket.on('news', function (data) {
    console.log(data)
  })

  const form = document.querySelector('#first-view form')

  form.addEventListener('submit', function onFormSubmit (e) {
    e.preventDefault()
    console.log('submitting')
  })
})()
