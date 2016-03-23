import { ql, application, getQuery, treeToDb, dbToTree, astToExpr , decorator as disto, subquery, log } from '../src'

import React, { Component } from 'react'

global.DISTO = 'development'

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

@disto()
class Person extends Component {
  static ident =  ({ name }) => [ 'byname', name ]
  static query = () => ql`[name points age]`
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

@disto()
class ListView extends Component {
  render() {
    let { list } = this.props
    return <ul>{list.map(person =>
      <Person key={person.name} {...person}/>)}
    </ul>
  }
}


@disto()
class RootView extends Component {
  static query = () =>
    ql`[{one ${getQuery(Person)}} {two ${getQuery(Person)}}]`

  componentDidMount() {
    setTimeout(() => subquery(this, 'list/one', ListView)::log(), 1000)

  }
  render() {
    let { one, two } = this.props
    return <div>
      <h2>List A</h2>
      <ListView refer='list/one' list={one} />
      <h2>List B</h2>
      <ListView refer='list/two' list={two} />
    </div>
  }
}

function read(env, key /*, params */) {
  return {
    value: dbToTree([ astToExpr(env.ast) ], env.get())[key]
  }
}

function updateIn(o, [ key, ...rest ], fn) {
  if(rest.length === 0) {
    return { ...o, [key]: fn(o[key]) }
  }
  return { ...o, [key]: updateIn(o[key], rest, fn) }
}

function mutate(env, action) {
  if(action.type === 'increment') {
    let name = action.payload.name
    return {
      // read: ql`[byname ${name} points]`,
      effect: () => env.store.swap (x =>
        updateIn(x, [ 'byname', name, 'points' ], val => val + 1))
    }
  }
}

// transact is very much like setState in this regard, in that it might not immediately take effect

let app = application({
  read,
  mutate,
  store: treeToDb(getQuery(RootView), initial)::log()
})

app.add(RootView, window.app)
