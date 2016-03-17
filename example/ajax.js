import React from 'react'

import { ql, application, decorator as disto, exprTo } from '../src'

import jsonp from 'jsonp'

let baseUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search='

function searchWiki(query, done) {
  jsonp(baseUrl + query, {}, (err, data) => done(err, { results: data }))
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


function send({ search }, { merge /*, dispatch, optimistic */ }) {
  for(let expr of search) {
    let { key, params } = exprTo(expr)
    if(key === 'results') {
      searchWiki(params.query, (err, res) => {
        if(res) { merge(res) }
        else{ /* silent fail */ }
      })
    }
  }
}


application({
  read,
  send,
  remotes: [ 'search' ]
}).add(AutoCompleter, window.app)

