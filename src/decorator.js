import React, { PropTypes, Component } from 'react'

import { log } from './util'


export default function decorator() {
  return function (Target) {

    return class Disto extends Component {
      static displayName = '∂:' + (Target.displayName || Target.name)
      // pull some statics from target
      static query = Target.query
      static ident = Target.ident
      static variables = Target.variables
      static schemaAttribute = Target.schemaAttribute

      static contextTypes = {
        disto: PropTypes.object,
        'disto:path': PropTypes.array,
        'disto:register': PropTypes.func,
        'disto:unregister': PropTypes.func
      }
      static childContextTypes = {
        'disto:path': PropTypes.array
      }
      getChildContext() {
        return {
          'disto:path': this._path()
        }
      }
      _path() {
        return [ ...this.context['disto:path'], [ this.props.refer || '*', Disto ] ]
      }
      componentWillMount() {
        this['disto:path']  = this._path()
        this.context['disto:register'](this['disto:path'], this, Disto)
      }
      componentWillReceiveProps(nextProps) {
        // this.context.disto.nextProps(this, nextProps)
      }
      setQuery = (query, variables) => {
        this.context.disto.setQuery(this, query, variables)
      }
      setVariables = vars => {
        this.context.disto.setVariables(this, vars)
      }
      _setState = state => {
        this.context.disto.setState(this, state)
      }
      // updateQuery = fn => {

      // }
      transact = (action, force) => {
        // need to annotate action with component
        this.context.disto.transact(this, action, force)
      }

      render() {
        let p = this['disto:path']
        let { query, ident, variables, state } =
          (this.context.disto.env.store.getState().components::find(x =>
            comparePaths(x[0], p)) || [])[1] || {}
        return <Target
          {...this.props}
          distoPath={this['disto:path']}
          query={query}
          ident={ident}
          variables={variables}
          state={state}
          setQuery={this.setQuery}
          setVariables={this.setVariables}
          setState={this._setState}
          transact={this.transact}
          disto={this.context.disto}
          // need merge!()

        >{this.props.children}</Target>
      }
      componentWillUnmount() {
        // this.context.disto.unregister(this.context['disto:path'], this, Disto)
        this.context['disto:unregister'](this['disto:path'], this, Disto)
        delete this['disto:path'] //  = this._path()

      }
    }
  }
}

function find(fn) {
  for(let i = 0; i< this.length; i++) {
    if(fn(this[i])) {
      return this[i]
    }
  }
}

function comparePaths(p1, p2) {

  if(p1.length !== p2.length) {
    return false
  }
  let ctr = 0, matches = true
  while(ctr < p1.length) {
    if(p1[ctr][0] !== p2[ctr][0] || p1[ctr][1] !== p2[ctr][1]) {
      matches = false
      break
    }
    ctr++
  }
  return matches
}
