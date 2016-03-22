// buggy !!!

import React, { Component } from 'react'
import isPlainObject from 'lodash.isplainobject'
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

function mutate({ store }, action) {
  if(action.type === 'increment') {
    return {
      remote: true,
      effect: () => store.swap(x =>
        ({ ...x, count: x.count + 1 }))
    }
  }
}


function send({ remote }, cb) {
  if(isPlainObject(remote)) { // mutation
    incrementService((err, res) => cb(x => err ?
      { errors: [ ...x.errors, err ], attempts: x.attempts + 1 } :
      { count: res, attempts: x.attempts + 1 }
    ))
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


application({
  read,
  mutate,
  store: { count: 0, errors: [], attempts: 0 },
  send,
  remotes: [ 'remote' ]
}).add(Counter, window.app)
