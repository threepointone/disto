import React, { PropTypes, Component } from 'react'


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

      // optimistic = (...args) => {
      //   return this.context.disto.optimistic(this, ...args)
      // }

      // references = {}
      // makeRef = key => {
      //   return (el => {
      //     this.references[key] = el
      //     return () => delete this.references[key]
      //   })
      // }


      render() {
        let p = this['disto:path'].join('π')
        let { query, ident, variables, state } =
          this.context.disto.env.store.getState().components::find(x =>
            x[0].join('π') === p && x[1] === Disto) || {}
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

        // this.context.disto.unregister(this)
        // if(this.unrefer) {
        //   this.unrefer()
        //   delete this.unrefer
        // }

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
