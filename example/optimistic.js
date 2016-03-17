import React, { Component } from 'react'
import { ql, application, decorator as disto } from '../src'

@disto()
class Counter extends Component {
  static query = () => ql`[count errors attempts]`

  onClick = () => {

    let txn = this.props.optimistic({ type: 'increment' })

    // fake a service that fails half the time
    setTimeout(() =>
      Math.random() > 0.5 ?
        txn.commit() :
        txn.revert({ error: new Error('failed to count') }),
    1000)

  }

  render() {
    return <div onClick={this.onClick}>
      clicked {this.props.count} times <br/>
      {this.props.attempts} attempts : {this.props.errors.length} errors so far

    </div>
  }
}

function read(env, key) {
  return {
    value: env.get()[key]
  }
}

function reduce(state = { count: 0, errors: [], attempts: 0 }, action) {
  switch(action.type) {
    case 'increment': return { ...state, count: state.count + 1 }
    // notice there no code to 'decrement' the counter in case the 'service' fails.
    // this update gets automatically reverted on increment:revert

    // the following two are optional, we include it to count attempts/errors
    case 'increment:commit': return { ...state, attempts: state.attempts + 1 }
    case 'increment:revert': return { ...state, attempts: state.attempts + 1 , errors: [ ...state.errors, action.error ] }
  }
  return state
}

application({ read, reduce }).add(Counter, window.app)
