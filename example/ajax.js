import React from 'react'

import { ql, makeParser, makeReconciler, decorator as disto, exprTo } from '../src'

import JSONP from './jsonp'

function searchWiki(query, done) {
  let baseUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search='
  JSONP({
    url: baseUrl + query,
    success: data => done(null, { results: data })
  })
}

@disto()
class AutoCompleter extends React.Component {
  static params =  () =>
    ({ term: '' })

  static query = () =>
    ql`[ ( results { query ?term } ) ]`

  onChange = e =>
    this.props.setParams({ term: e.target.value }) // ! this works!

  render() {
    let { results, params: { term } } = this.props
    return <div>
      <h2>AutoCompleter!</h2>
      <input value={term} onChange={this.onChange}/>
      <ul>
      {results ?
        results.map((r, i) => <li key={i}>{r}</li>) :
        'loading...'}
      </ul>
    </div>
  }
}


function read(env, key /* , params */ ) {
  return {
    value: env.get()[key],
    search: key === 'results' ? env.ast : undefined
  }
}


function send({ search }, cb) {
  for(let expr of search) {
    let { key, params } = exprTo(expr)
    if(key === 'results') {
      searchWiki(params.query, cb)
    }
  }
}


let reconciler = makeReconciler({
  parser: makeParser({ read }),
  send,
  remotes: [ 'search' ]
})

reconciler.add(AutoCompleter, window.app)
