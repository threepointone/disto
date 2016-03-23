import { ql, application, getQuery, decorator as disto, log
  // , treeToDb, dbToTree, ,
} from '../src'

import React, { Component } from 'react'

const store = {
  active: 'all',
  todos: [
    { id: 0, text: 'asdsad' },
    { id: 1, text: 'sadfsdf' },
    { id: 2, text: 'sdfdsf' },
    { id: 3, text: 'sdfsdf' }
  ]
}

@disto()
class App extends Component {
  static query = () => ql`[
    { byType [ { [filter _] ${getQuery(Item)} } ] }
    { footer ${getQuery(Footer)} }
  ]`
  onChange = e => {

  }
  render() {
    let { byType, footer } = this.props
    return <div>
      <input onChange={this.onChange} />
      { byType.map(todo => <Item {...todo}/>) }
      <Footer {...footer}/>
    </div>
  }
}

@disto()
class Item extends Component {
  static query = () => ql`[id text done]`
  render() {
    let { id, text, done } = this.props
    return <div>
      id: {id} text: {text} done: {!!done}
    </div>
  }
}

@disto()
class Footer extends Component {
  static query = () => ql`[[filter _] total remaining ]`
  render() {
    let { filter, total, remaining } = this.props
    return <div>
      footer {filter} {total} {remaining}
    </div>
  }
}

function read(env, key, params) {
  if(key === 'byType') {
    let value = Object.entries(env.get().byId).filter(([ k, v ]) => {
      // k::log() 
      switch (params.type) {
        case 'active':
          return !v.done
        case 'completed':
          return !!v.done
        default:
          return true
      }
    })
    return { value }
  }
  if(key === 'footer') {
    return {
      value: {

      }
    }
  }
}

function mutate(env, { type, payload }) {
  switch(type) {
    case 'add:todo':
      return {
        effect: () => env.store.swap(x => ({
          ...x,
          byId: {
            ...x.byId,
            [payload.id]: payload
          }
        }))
      }
    case 'finish:todo':
      return {
        effect: () => env.store.swap(x => ({
          ...x,
          byId: {
            ...x.byId,
            [payload.id]: { ...x.byId[payload.id], done: true }
          }
        }))
      }
    case 'unfinish:todo':
      return {
        effect: () => env.store.swap(x => ({
          ...x,
          byId: {
            ...x.byId,
            [payload.id]: { ...x.byId[payload.id], done: false }
          }
        }))
      }
    case 'clear:completed':
      return {
        effect: () => env.store.swap(x => ({
          ...x,
          byId: Object.entries(x).reduce((o, [ k, v ]) => {
            if(!v.done) { o[k] = v }
            return o
          }, {})
        }))
      }
  }
}

application({ read, mutate, store }).add(App, window.app)

//
// `
//   {
//     filter: all | completed | active
//     todos
//       [Item]
//     byType {
//       all
//       active
//       completed
//     }
//     Item:byId {
//       id string/number
//       text string
//       done boolean = false
//     }
//     footer {
//       active
//       total
//       remaining
//     }
//   }
// `
// add:todo {text}
// finish:todo {id}
// unfinish:todo {id}
//
