import { ƒ, makeParser, makeStore, makeReconciler, getQuery, dbToTree, astTo, treeToDb, log, withMeta, meta } from '../src'
import React, { Component } from 'react'


const initial = {
  currentUser: { email: 'bob@gmail.com' },
  items: [ { id: 0, title: 'Foo' }, { id: 1, title: 'Bar' }, { id: 2, title: 'Baz' } ]
}

function read(env, key /*, params */) {
  console.log('read', arguments)
  return {
    value: dbToTree([ astTo(env.ast) ], env.get())[key]
  }
}

class Item extends Component {
  static ident = ctx => [ 'byId', ctx.id ]
  static query = () => ƒ`id title [currentUser _]`
  render() {
    let { title, currentUser = {} } = this.props
    return <li>
      <div>{title}</div>
      <div>{currentUser.email}</div>
    </li>
  }
}

class List extends Component {
  static query = () => ƒ`{items ${getQuery(Item)}}`
  render() {
    return <div>
      <h2>A List!</h2>
      <ul>
        {this.props.items.map(item => <Item key={item.id} {...item}/>)}
      </ul>
    </div>
  }
}

const normalized = treeToDb(getQuery(List), initial)::log()

let reconciler = makeReconciler({
  parser: makeParser({ read }),
  store: makeStore({ _: normalized  })
})

reconciler.add(List, window.app)
