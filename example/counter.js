import React, { Component } from 'react'
import { decorator as ann, parser, R } from '../src'
import { toString, parse as ƒ }  from '../src/ql'

function print() {
  return JSON.stringify(this, null, ' ')::log()
}

function log() {
  console.log(this) // eslint-disable-line no-console
  return this
}

toString(ƒ(`search (q="red shoes" a=123 :remote) {
  products {
    id
    name (:defer)
    styleid
  }}`))::log()


@ann({
  query: ƒ('counter')
})
class App extends Component {
  onClick = () => {
    this.props.transact({
      type: 'increment', payload: 1 })
  }
  render() {
    return <div onClick={this.onClick}>
      clicked {this.props.counter} times
    </div>
  }
}

const state = {
  counter: 0
}

R.make({
  state,
  parser: parser({
    read: (env, key, node) => ({ value: env.state[key] }),
    mutate(env, { type, payload }) {
      if(type === 'increment') {
        return {
          keys: [ 'counter' ],
          effect: () => state.counter = state.counter + payload
        }
      }
    }
  })
}).add(App, window.app)
