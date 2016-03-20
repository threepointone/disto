import { ql, application, getQuery, dbToTree, astToExpr, treeToDb, log } from '../src'
import React, { Component } from 'react'


const initial = {
  currentUser: { email: 'bob@gmail.com' },
  items: [ { id: 0, title: 'Foo' }, { id: 1, title: 'Bar' }, { id: 2, title: 'Baz' } ]
}

function read(env, key /*, params */) {
  return {
    value: dbToTree([ astToExpr(env.ast) ], env.get())[key]
  }
}

class Item extends Component {
  static ident = ctx => [ 'byId', ctx.id ]
  static query = () => ql`[id title [currentUser _]]`
  render() {
    let { title, currentUser = {} } = this.props
    return <li>
      <div>{title}</div>
      <div>{currentUser.email}</div>
    </li>
  }
}

class List extends Component {
  static query = () => ql`[{items ${getQuery(Item)}}]`
  render() {
    return <div>
      <h2>A List!</h2>
      <ul>
        {this.props.items.map(item => <Item key={item.id} {...item}/>)}
      </ul>
    </div>
  }
}

const store = treeToDb(getQuery(List), initial)::log()

let app = application({
  read,
  store
})

app.add(List, window.app)
