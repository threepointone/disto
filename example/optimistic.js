// doesn't work right now!!!
// doesn't work right now!!!
// doesn't work right now!!!
// doesn't work right now!!!

import React, { Component } from 'react'
import { ql, application, decorator as disto } from '../src'

@disto()
class Counter extends Component {
  static query = () => ql`[count errors attempts]`

  onClick = () => {
    this.props.transact({ type: 'increment' })
  }

  render() {
    let { count, errors = [], attempts } = this.props
    return <div onClick={this.onClick}>
      clicked {count} times <br/>
      {attempts} attempts : {errors.length} errors
    </div>
  }
}

function read(env, key) {
  return { value: env.get()[key] }
}

function mutate(env, action) {
  if(action.type === 'increment') {
    return {
      remote: true,
      effect: () => env.store.swap(x =>
        ({ ...x, count: x.count + 1 }))
    }
  }
}


// remote data
let ctr = 0
function incrementService(cb) {
  setTimeout(() => {
    Math.random() > 0.5 ?
      cb(null, ++ctr) :
      cb(new Error('failed to count'))
  }, 1000)
}

// this is wrong, doesn't do optimistic updates right now!!!
function send({ remote }, cb) {
  if(!Array.isArray(remote)) { // mutation, not read
    let { errors, attempts, count } = remote.env.get()
    incrementService((err, res) => cb( err ?
      { count:  count - 1, errors: [ ...errors, err ] } :
      { count: res, attempts: attempts + 1 }
    ))
  }
}

application({
  read,
  mutate,
  store: { count: 0, errors: [], attempts: 0 },
  send,
  remotes: [ 'remote' ]
}).add(Counter, window.app)
