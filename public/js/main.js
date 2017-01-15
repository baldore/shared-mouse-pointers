/* global Rx, io, React, ReactDOM */
/* eslint-disable space-before-function-paren */
(() => {
  'use strict'

  const r = React.createElement.bind(React)

  class App extends React.Component {
    constructor(props) {
      super(props)

      this.onFormSubmit = this.onFormSubmit.bind(this)

      this.state = {
        username: null
      }

      this.socket = null
    }

    onFormSubmit(username) {
      this.setState({ username })
    }

    render() {
      const { username } = this.state

      return (
        r('div', null, [
          !username
            ? r(SetUsernameView, { onSubmit: this.onFormSubmit })
            : r(SharedPointersView, { username })
        ])
      )
    }
  }

  class SetUsernameView extends React.Component {
    constructor(props) {
      super(props)

      this.setUsername = this.setUsername.bind(this)
    }

    setUsername(e) {
      e.preventDefault()

      const value = this.inputRef.value.trim()

      if (value) {
        this.props.onSubmit(value)
      }
    }

    render() {
      return (
        r('div', { className: 'full-screen-view' }, [
          r('form', { onSubmit: this.setUsername }, [
            r('label', { className: 'form-group' }, [
              r('span', { className: 'form-label' }, `What's your name?`),
              r('input', {
                className: 'form-input',
                type: 'text',
                name: 'username',
                ref: (input) => (this.inputRef = input)
              })
            ])
          ])
        ])
      )
    }
  }

  class SharedPointersView extends React.Component {
    constructor(props) {
      super(props)

      this.socket = null
      this.pointerMoveSubscription = null
    }

    componentDidMount() {
      this.socket = io.connect('http://localhost:3000')
      const pointerMove$ = Rx.Observable.fromEvent(document, 'mousemove')
        .map((e) => ({
          username: this.props.username,
          x: Math.floor((e.clientX / window.innerWidth).toFixed(2) * 100),
          y: Math.floor((e.clientY / window.innerHeight).toFixed(2) * 100)
        }))
        .throttle(40)

      this.pointerMoveSubscription = pointerMove$.subscribe(
        (data) => this.socket.emit('pointer-move', data)
      )
    }

    componentWillUnmount() {
      this.socket.disconnect()
      this.pointerMoveSubscription()
    }

    render() {
      return (
        r('div', null, [
          r('div', { className: 'fixed-panel' }, [
            r('p', null, `x (percentage):`),
            r('p', null, `y (percentage):`)
          ])
        ])
      )
    }
  }

  ReactDOM.render(React.createElement(App), document.querySelector('#app'))

  // socket.on('response', (data) => console.log('taaake your data', data))
  //
  // const pointerMove$ = inputValueOnSubmit$
  //   .flatMap((username) =>
  //     Rx.Observable.fromEvent(document, 'mousemove')
  //       .map((e) => ({
  //         username,
  //         x: Math.floor((e.clientX / window.innerWidth).toFixed(2) * 100),
  //         y: Math.floor((e.clientY / window.innerHeight).toFixed(2) * 100)
  //       }))
  //   )
  //   .throttle(40)
  //
  // pointerMove$.subscribe(
  //   (data) => {
  //     socket.emit('pointer-move', data)
  //     // Maybe this should be done in the response, since the data is being already sent
  //     xCoord.innerText = `${data.x}%`
  //     yCoord.innerText = `${data.y}%`
  //   }
  // )
})()
