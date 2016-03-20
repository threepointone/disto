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
        disto: PropTypes.object
      }
      componentWillMount() {
        let { disto } = this.context
        if(this.props.refer) {
          this.unrefer = this.props.refer(this)
        }

        disto.register(this, Disto)
      }
      componentWillReceiveProps(nextProps) {
        // this.context.disto.nextProps(this, nextProps)
      }
      setQuery = (query, variables) => {
        let { disto } = this.context
        disto.setQuery(this, query, variables)
      }
      setVariables = vars => {
        let { disto } = this.context
        disto.setVariables(this, vars)

      }
      _setState = state => {
        this.context.disto.setState(this, state)
      }
      updateQuery = fn => {

      }
      transact = (action, query, remote) => {
        // need to annotate action with component
        this.context.disto.transact(action, query, remote)
      }
      optimistic = (...args) => {
        return this.context.disto.optimistic(...args)
      }

      references = {}
      makeRef = key => {
        return (el => {
          this.references[key] = el
          return () => delete this.references[key]
        })
      }


      render() {
        let { query, ident, variables, state } = this.context.disto.env.store.getState().components.get(this) || {}
        return <Target
          {...this.props}
          query={query}
          ident={ident}
          variables={variables}
          state={state}
          setQuery={this.setQuery}
          setVariables={this.setVariables}
          setState={this._setState}
          optimistic={this.optimistic}
          transact={this.transact}
          makeRef={this.makeRef}
          // need merge!()

        >{this.props.children}</Target>
      }
      componentWillUnmount() {
        this.context.disto.unregister(this)
        if(this.unrefer) {
          this.unrefer()
          delete this.unrefer
        }

      }
    }
  }
}
