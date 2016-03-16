import { ƒ, makeParser, makeStore, makeReconciler, getQuery, dbToTree, astTo, treeToDb, log, withMeta, meta, decorator as $ } from '../src'

import React, { Component } from 'react'

import JSONP from './jsonp'

let baseUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search='

function read(env, key, params) {
  console.log(env, key, params)
  if(key === 'results') {
    return {
      value: env.get()[key],
      search: env.ast
    }
  }
}


@$()
class AutoCompleter extends Component {
  static params =  () => ({ query: '' })
  static query = (params) => ƒ`'results { query 123 }`
  onChange = e => {
    this.props.setParams({ query: e.target.value }) // !
  }
  render() {
    let { results, params } = this.props
    return <div>
      <h2>AutoCompleter!</h2>
      <input value={params.query}/>
      {results ? results.map(r => <li>{r}</li>) : 'loading...'}
    </div>
  }
}

function send({ search }, cb) {
  JSONP({
    url: baseUrl + search,
    success: data => cb({ results: data })
  })
}

// const normalized = treeToDb(getQuery(RootView), initial)

// function reduce(state = {}, { type, payload: { name } = {} }) {
//   if(type === 'increment') {
//     return updateIn(state, [ 'byname', name, 'points' ], val => val + 1)
//   }
//   return state
// }

let reconciler = makeReconciler({
  parser: makeParser({ read }),
  store: makeStore(),
  send
})

reconciler.add(AutoCompleter, window.app)
