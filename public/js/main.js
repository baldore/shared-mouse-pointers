/* global Rx, io, React, ReactDOM */
/* eslint-disable space-before-function-paren */
(() => {
  'use strict'

  const r = React.createElement.bind(React)

  class App extends React.Component {
    constructor(props) {
      super(props)

      this.state = {
        username: null
      }
    }

    render() {
      const { username } = this.state

      return (
        r('div', null, [
          !username
            ? r(SetUsernameView, { onSubmit: (name) => this.setState({ username: name }) })
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

      this.state = {
        x: null,
        y: null,
        pointers: []
      }

      this.socket = null
      this.pointerMoveSubscription = null
    }

    componentDidMount() {
      const { username } = this.props

      this.socket = io.connect('http://localhost:3000')

      const pointerMove$ = Rx.Observable.fromEvent(document, 'mousemove')
        .map((e) => ({
          id: this.socket.id,
          username,
          x: Math.floor((e.clientX / window.innerWidth).toFixed(2) * 100),
          y: Math.floor((e.clientY / window.innerHeight).toFixed(2) * 100)
        }))
        .throttle(15)

      this.pointerMoveSubscription = pointerMove$.subscribe(
        (data) => {
          this.socket.emit('pointer-move', data)
          this.setState({ x: data.x, y: data.y })
        }
      )

      this.socket.on('pointers-update', (pointers) => {
        delete pointers[this.socket.id] // Avoids to show our own pointer
        const otherPointers = Object.keys(pointers).map((id) => pointers[id])
        this.setState({ pointers: otherPointers })
      })
    }

    componentWillUnmount() {
      this.socket.disconnect()
      this.pointerMoveSubscription()
    }

    render() {
      const { x, y, pointers } = this.state

      return (
        r('div', null, [
          r(Pointers, { pointers }),
          (!x || !y)
            ? null
            : r('div', { className: 'fixed-panel' }, [
              r('p', null, `x (percentage): ${x}`),
              r('p', null, `y (percentage): ${y}`)
            ])
        ])
      )
    }
  }

  function Pointers({ pointers = [] }) {
    if (pointers.length === 0) {
      return null
    }

    const pointerElements = pointers.map((pointer) =>
      r('div', {
        className: 'fixed-pointer',
        style: {
          left: `${pointer.x}%`,
          top: `${pointer.y}%`
        }
      })
    )

    return (
      r('div', null, pointerElements)
    )
  }

  ReactDOM.render(React.createElement(App), document.querySelector('#app'))
})()
