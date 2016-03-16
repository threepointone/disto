import { ql, makeParser, makeStore, makeReconciler, getQuery, treeToDb, dbToTree, astTo, decorator as $, log } from '../src'

import React, { Component } from 'react'

global.DISTO = 'development'

function updateIn(o, [ key, ...rest ], fn) {
  if(rest.length === 0) {
    return { ...o, [key]: fn(o[key]) }
  }
  return { ...o, [key]: updateIn(o[key], rest, fn) }
}

const initial = {
  'one': [
    { name: 'john', points: 0 },
    { name: 'mary', points: 0 },
    { name: 'bob', points: 0 }
  ],
  'two': [
    { name: 'mary', points: 0, age: 27 },
    { name: 'gwen', points: 0 },
    { name: 'jeff', points: 0 }
  ]
}

@$()
class Person extends Component {
  static ident =  ({ name }) => [ 'byname', name ]
  static idAttribute = 'name'
  static query = () => ql`name points age`
  onClick = () => {
    this.props.transact({ type: 'increment', payload: { name: this.props.name } })
  }
  render() {
    let { points, name } = this.props
    return <li>
      <label>{name}, points: {points}</label>
      <button onClick={this.onClick}> + </button>
    </li>

  }
}

class ListView extends Component {
  render() {
    let { list } = this.props
    return <ul>{list.map(person =>
      <Person key={person.name} {...person}/>)}
    </ul>
  }
}


@$()
class RootView extends Component {
  static query = () =>
    ql`{one ${getQuery(Person)}} {two ${getQuery(Person)}}`
  render() {
    let { one, two } = this.props
    return <div>
      <h2>List A</h2>
      <ListView list={one} />
      <h2>List B</h2>
      <ListView list={two} />
    </div>
  }
}

function read(env, key /*, params */) {
  return {
    value: dbToTree([ astTo(env.ast) ], env.get())[key]
  }
}

const normalized = treeToDb(getQuery(RootView), initial)::log()

function reduce(state = normalized, { type, payload: { name } = {} }) {
  if(type === 'increment') {
    return updateIn(state, [ 'byname', name, 'points' ], val => val + 1)
  }
  return state
}

let reconciler = makeReconciler({
  parser: makeParser({ read }),
  store: makeStore(reduce)
})

reconciler.add(RootView, window.app)
