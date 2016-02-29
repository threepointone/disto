/* global describe it */
import { parse as ƒ } from '../src/ql'
import expect from 'expect'


function h(node, props, tags, fields) {
  let n = { node }
  if(props) {
    n.props = props
  }
  if(tags) {
    n.tags = tags
  }
  if(fields) {
    n.fields = fields
  }
  return n
}

describe('disto', () => {
  describe('ql', () => {
    it('can point to nodes', () => {
      expect(ƒ('x')).toEqual([ h('x') ])
    })

    it('can accept props', () => {
      expect(ƒ('x(a=1 b="pqr")')).toEqual([ h('x', { a: 1, b:'pqr' }) ])
    })

    it('can define sub nodes', () => {  // signicificant spacing!!!
      expect(ƒ(` x {
        y(n=2){ z }
        a b
      }`)).toEqual([ h('x', null, null, [ h('y', { n: 2 }, null, [ h('z') ]), h('a'), h('b') ]) ])

    })

    it('can accept tags', () => {
      expect(ƒ('x (:a :b)')).toEqual([ h('x', null, [ 'a', 'b' ]) ])
    })

    it('can compose')
  })

})


// cacheOpts: {}, // ?

// G.define('search', {
//   collection: true,
//   *saga(props) {}, // can do sync/async/subscriptions
//   fields: {
//     products: {
//       more: {
//         resolve: o => `product(styleid=$.id) :all`
//       }
//     }
//   }
// })

// G.define('product', {
//   *saga(props) {
// })


// G.get(`
// search q='red shoes' :remote
//   products
//     name
//     id
//     image :all
//     more :defer
//       styleNote
// `)

// G.remote(g, `
// search q='red shoes' :remote
//   products
//     name
//     id
//     image
//     more
//       styleNote
// `)

// {
//   search: {
//     products: [{
//       name,
//       id,
//       image,
//       more: {
//         styleNote
//       }
//     }]
//   }
// }

// @query(props => <query>
//   <search query='red shoes'>
//     <product />
//   </search>
// </query>)
// class App extends Component {
//   render (){
//     let {todos} = this.props.todos[2].text
//     return <div/>
//   }
// }
