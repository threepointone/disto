import React, { PropTypes, Component } from 'react'

export default function decorator() {
  return function (Target) {

    return class Disto extends Component {
      // pull some statics from target
      static query = Target.query
      static ident = Target.ident
      static params = Target.params
      static idAttribute = Target.idAttribute
      static schemaAttribute = Target.schemaAttribute

      static contextTypes = {
        disto: PropTypes.object
      }
      state = this.resolve()
      componentWillMount() {
        let { disto } = this.context
        disto.register(this)

      }
      resolve(p = this.props) {

        let qp = Disto.params ? Disto.params(p) : undefined,
          id = Disto.ident ? Disto.ident(p) : undefined,
          q = Disto.query ? Disto.query(p, qp) : undefined

        return {
          ident: id,
          query: q,
          params: qp
        }
      }
      componentWillReceiveProps(nextProps) {
        this.setState(this.resolve(nextProps))
      }
      setQuery = (query, params) => {

      }
      setParams = params => {

      }
      updateQuery = fn => {

      }
      transact = (action, keys) => {
        this.context.disto.transact(action, keys)
        // this.setState(this.resolve())
      }
      render() {
        return <Target
          {...this.props}
          ident={this.state.ident}
          query={this.state.query}
          params={this.state.params}
          setQuery={this.setQuery}
          setParams={this.setParams}
          transact={this.transact}
        >{this.props.children}</Target>
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
