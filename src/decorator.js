import React, { PropTypes, Component } from 'react'

// import { bindParams } from './ql'

export default function decorator() {
  return function (Target) {

    return class Disto extends Component {
      static displayName = '∂:' + (Target.displayName || Target.name)
      // pull some statics from target
      static query = Target.query
      static ident = Target.ident
      static params = Target.params
      static schemaAttribute = Target.schemaAttribute

      static contextTypes = {
        disto: PropTypes.object
      }
      componentWillMount() {
        let { disto } = this.context
        this.unrefer = (this.props.refer || (() => {}))(this)
        disto.register(this, Disto)
      }
      componentWillReceiveProps(nextProps) {
        // this.context.disto.nextProps(this, nextProps)
      }
      setQuery = (query, params) => {
        let { disto } = this.context
        disto.setParams(this, query, params)
      }
      setParams = params => {
        let { disto } = this.context
        disto.setParams(this, params)

      }
      _setState = state => {
        this.context.disto.setState(this, state)
      }
      updateQuery = fn => {

      }
      transact = (action, query, remote) => {
        this.context.disto.transact(this, action, query, remote)
      }
      optimistic = (...args) => {
        return this.context.disto.optimistic(this, ...args)
      }

      references = {}
      makeRef = key => {
        return (el => {
          this.references[key] = el
          return () => delete this.references[key]
        })
      }


      render() {
        let { query, ident, params, state } = this.context.disto.env.store.getState().components.get(this) || {}
        return <Target
          {...this.props}
          query={query}
          ident={ident}
          params={params}
          state={state}
          setQuery={this.setQuery}
          setParams={this.setParams}
          setState={this._setState}
          optimistic={this.optimistic}
          transact={this.transact}
          makeRef={this.makeRef}
          __onUnmount={this.__onUnmount}

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
