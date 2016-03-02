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

ƒ(`search (q="red shoes" a=123 :remote) {
  products {
    id
    name (:defer)
    styleid
  }}`)::log()


@ann({
  query: ƒ('counter')
})
class App extends Component {
  render() {
    let { transact, counter } = this.props
    return <div onClick={() => transact({ type: 'tick' })}>
      clicked { counter } times
    </div>
  }
}


R.make({
  initial: { counter: 0 },
  parser: parser({
    read: (env, key) => ({ value: env.store.getState()[key] }),
    mutate(env, action) {
      return {
        keys: [ 'counter' ],
        effect: () => env.store.dispatch(action)
      }
    }
  }),
  reducers: {
    counter: (state = 0, action) =>
      action.type === 'tick' ? state + 1 : state
  }
}).add(App, window.app)
