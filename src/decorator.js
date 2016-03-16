import React, { PropTypes, Component } from 'react'

import { bindParams } from './graffo'

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
        let { disto } = this.context;
        (this.props.onRef || (() => {}))(this)
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
      transact = (action, keys) => {
        this.context.disto.transact(action, keys)
      }
      makeRef = key => {
        return (el => this.refs[key] = el)
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
          transact={this.transact}
          makeRef={this.makeRef}
        >{this.props.children}</Target>
      }
      componentWillUnmount() {
        this.context.disto.unregister(this)
      }
    }
  }
}

// export default function disto({
//   ident = null, // optional!!!
//   query = () => {},
//   queryParams = () => {}
// }) {


//   return function (Target) {
//     return class Disto extends Component {
//       static contextTypes = {
//         disto: PropTypes.object
//       }
//       componentWillMount() {
//         let { disto } = this.context

//         disto.register(this)
//         this.setState(this.resolve())

//       }
//       resolve() {
//         let { disto } = this.context

//         let qp = queryParams(this.props),
//           id = ident(this.props),
//           q = query(this.props, qp),
//           v = disto.read(q)

//         return {
//           ident: id,
//           query: q,
//           params: qp,
//           value: v
//         }
//       }
//       setQuery = (query, params) => {

//       }
//       setQueryParams = params => {

//       }
//       updateQuery = fn => {

//       }
//       transact = (action, keys) => {
//         this.context.disto.transact(this, action, keys)
//         this.setState(this.resolve())
//       }
//       // force?
//       render() {
//         return <Target
//           {...this.props}
//           {...this.state.value}
//           ident={this.state.ident}
//           query={this.state.query}
//           params={this.state.params}
//           setQuery={this.setQuery}
//           updateQuery={this.updateQuery}
//           transact={this.transact}>
//           {this.props.children}
//         </Target>
//       }
//     }
//   }
// }
