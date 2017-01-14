/* global Rx */
(() => {
  'use strict'

  const firstView = document.querySelector('#first-view')
  const secondView = document.querySelector('#second-view')
  const form = firstView.querySelector('form')
  const input = form.querySelector('input[type="text"]')

  const inputValueOnSubmit$ = Rx.Observable.fromEvent(form, 'submit')
    .do((e) => e.preventDefault())
    .map(() => input.value.trim())
    .filter((string) => string !== '')

  inputValueOnSubmit$.subscribe(
    () => {
      firstView.remove()
      secondView.classList.remove('hidden')
    }
  )
})()
