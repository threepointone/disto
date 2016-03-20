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

function mutate(env, { type }) {
  if (type ==='tick') {
    return {
      // value: { keys:[ 'counter' ] }, // not needed here because it's already part of the root component query?
      effect: () => env.store.swap(({ counter }) =>
        ({ counter: counter + 1 }))
    }
  }
}


application({ read, mutate, store: { counter: 0 } }).add(App, window.app)

