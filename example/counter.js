import React, { Component } from 'react'
import { ql, application, decorator as disto } from '../src'

@disto()
class App extends Component {
  static query = () => ql`[counter]`
  onClick = () => this.props.transact({ type: 'tick' })
  render() {
    return <div onClick={this.onClick}>
      clicked { this.props.counter } times
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

application({ read, reduce }).add(App, window.app)

