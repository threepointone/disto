import React, { Component, PropTypes } from 'react'
import { ƒ, makeParser, makeStore, makeReconciler } from '../src'

class App extends Component {
  static query = () => ƒ`counter`
  static contextTypes = {
    disto: PropTypes.object
  }
  onClick = () => this.context.disto.transact({ type: 'tick' })
  render() {
    let { counter } = this.props
    return <div onClick={this.onClick}>
      clicked { counter } times
    </div>
  }
}

function read(env, key /*, params */) {
  return {
    value: env.get()[key]
  }
}

function reduce(state = { counter: 0 }, { type }) {
  if(type === 'tick') {
    return { counter : state.counter + 1 }
  }
  return state
}

let reconciler = makeReconciler({
  parser: makeParser({ read }),
  store: makeStore(reduce)
})


reconciler.add(App, window.app)
