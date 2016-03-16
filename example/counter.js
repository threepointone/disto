import React, { Component } from 'react'
import { ql, makeParser, makeStore, makeReconciler, decorator as $ } from '../src'

@$()
class App extends Component {
  static query = () => ql`counter`
  onClick = () => this.props.transact({ type: 'tick' })
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
