import { ql as ƒ, makeParser, makeStore, makeReconciler, addRoot } from '../src'

import { Component } from 'react'

function print() {
  return JSON.stringify(this, null, ' ')::log()
}

function log() {
  console.log(this) // eslint-disable-line no-console
  return this
}
// import React,  from 'react'
function updateIn(o, [ head, ...tail ], fn) {
  if(tail.length === 0) {
    return { ...o, [head]: fn(o[head]) }
  }
  return { ...o, [head]: updateIn(o[head], tail, fn) }
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

function getQuery(Component) {
  return Component
}


function read(env, key, node) {
  console.log(key, node)
  return {
    value: env.store.getState()['_'][key]
  }
}

function mutate() {}

function reduce(state = {}, { type, payload: { name } = {} } = {}) {
  if(type === 'increment') {
    return updateIn(state, [ 'entities', 'byname', name ],
      val => ({ ...val, points: val.points + 1 }))
  }
  return state
}


class Person extends Component {
  static ident = ctx => [ 'byname', ctx.name ]
  static query = () => ƒ`name points`
  onClick = () => {
    this.props.transact(ƒ`!increment (by=1)`)//'{ type: 'increment', payload: this.props })
  }
  render() {
    // 'personview'::log()
    // this.props.name::log()
    let { points, name } = this.props
    return <li>
      <label>{name}, points: {points}</label>
      <button onClick={this.onClick}> + </button>
    </li>

  }
}

class ListView extends Component {
  render() {
    // 'listview'::log()
    // this.props.list::log()
    let { list } = this.props
    return <ul>{list.map(person =>
      <Person key={person.name} {...person}/>)}
    </ul>
  }
}


class RootView extends Component {
  static query = () =>
    ƒ`one {${getQuery(Person)} two {${{ uniontype: getQuery(Person) }}}`
  render() {
    // 'rootview'::log()
    let { one, two } = this.props
    return <div>
      <h2>List A</h2>
      <ListView {...one} />
      <h2>List B</h2>
      <ListView {...two} />
    </div>
  }
}


let parser = makeParser({
  read, mutate
})

let reconciler = makeReconciler({
  parser,
  store: makeStore(initial, reduce)
})

addRoot(reconciler, RootView, window.app)

// const normalized = treeTodb(RootView, initial, true)::log()


// const store = makeStore(normalized, reduce)

// parser.mutate({ store }, { type: 'increment', payload: { name: 'mary' } })
// parser.read({ store }, ƒ(`entities`)).entities.value.byname.mary::log()
// store.getState()::log()

// parser {:state st} '[(points/increment {:name "Mary"})])
// (parser {:state st} '[:list/one])



// `one ${{post: getQuery(Post), etc}}`

