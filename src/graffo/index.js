import { parse } from './parser'
import { Schema, normalize, arrayOf, unionOf } from 'normalizr'
import isPlainObject from 'lodash.isplainobject'

import ArraySchema from 'normalizr/lib/IterableSchema'
import UnionSchema from 'normalizr/lib/UnionSchema'

let metaCache = new WeakMap()

export function meta(o, k) {
  if(typeof o === 'symbol' || typeof o === 'string' || typeof o === 'number') {
    return
  }
  if(!metaCache.has(o)) {
    metaCache.set(o, {})
  }
  return metaCache.get(o)[k]
}

export function withMeta(o, m) {
  // only for objects!
  let newObj = Array.isArray(o) ? [ ...o ] : { ...o } // sets, maps?
  metaCache.set(newObj, m)
  return newObj
}

function randomStr() {
  let s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", N = 16
  return Array(N).join().split(',').map(() =>  s.charAt(Math.floor(Math.random() * s.length)) ).join('')
}


export function ƒ(strings, ...values) {
  let refs = {}, parsed = parse('[' + strings.reduce((arr, s, i) => {
      let v = values[i]

      let c = (Array.isArray(v) || isPlainObject(v)) ? meta(v, 'component') : null, rando = randomStr()
      if(c) {

        refs[rando] = v
        v = '[ ' + rando + ' ]'
      }
      return [ ...arr, s, v ]
    }, []).join('') + ']')
  // console.log(parsed, refs)

  let replaced = ƒreplace(parsed, refs)
  // console.log('replaced', replaced)
  return replaced


}

function ƒreplace(q, refs) {
  if(typeof q[0] === 'string' && q.length === 1 && refs[q[0]]) {
    if(isPlainObject(refs[q[0]])) {
      return Object.keys(refs[q[0]]).reduce((o, k) => (o[k] = ƒreplace(refs[q[0]][k], refs) ,o), {})
    }
    return withMeta(ƒreplace(refs[q[0]], refs), { component: meta(refs[q[0]], 'component') })
  }
  return q.map(expr => {
    if(typeof expr === 'string' || typeof expr === 'number') { // symbol? ident?
      return expr
    }

    if(expr instanceof Map) {
      // join
      return new Map([ ...expr.entries() ].map(([ k, v ]) => {
        if(isPlainObject(v)) {
          // union
          return [ k, Object.keys(v).reduce((o, kk) => (o[kk] = ƒreplace(v[kk], refs) ,o), {}) ]
        }
        return [ k, ƒreplace(v, refs) ]
      }))
    }
  })
}


export function log(msg) {
  console.log(msg || this) // eslint-disable-line no-console
  return this
}

export function print() {
  return JSON.stringify(this, null, ' ')::log()
}

function symbolTo(sym) {
  return {
    dispatch: sym,
    key: sym
  }
}

function keywordTo(k) {
  return {
    type: 'prop',
    dispatch: k,
    key: k
  }
}

function unionEntryTo([ k, v ]) {
  return  {
    type: 'union-entry',
    union: k,
    query: v,
    children: v.map(exprTo),
    component: meta(v, 'component')
  }

}

function unionTo(m) {
  return {
    type: 'union',
    query: m,
    children: Object.entries(m).map(unionEntryTo)
  }
}

function callTo(call) {
  let [ f, args ] = call
  // call = [ f, args ]

  if(typeof f === 'symbol') {
    return {
      ...exprTo(args),
      target: meta(call, 'target') || 'remote'
    }
  }
  let ast  = exprTo(f)
  ast = {
    ...ast,
    params: {
      ...ast.params,
      ...args || {}
    }
  }
  if(typeof ast.dispatch === 'symbol') {
    ast = {
      ...ast,
      type: 'call'
    }
  }
  return ast

}

export function queryTo(query) {
  return  {
    type: 'root',
    children: query.map(exprTo),
    component: meta(query, 'component')
  }
}

function joinTo(j) {
  let [ k, v ] = [ ...j.entries() ][0],
    ast = exprTo(k)

  ast = {
    ...ast,
    type: 'join',
    query: v,
    component: meta(v, 'component')
  }
  if(v !== Symbol.for('...') && typeof v !== 'number') {
    if(Array.isArray(v)) {
      ast = {
        ...ast,
        children: v.map(exprTo)
      }
    }
    else if(isPlainObject(v)) {
      ast = {
        ...ast,
        children: [ unionTo(v) ]
      }
    }
    else {
      throw new Error('Invalid Join', j)
    }
  }
  return ast
}

function identTo(i) {
  return {
    type: 'prop',
    dispatch: i[0],
    key: i
  }
}

export function exprTo(expr) {
  if(typeof expr === 'symbol') {
    return symbolTo(expr)
  }
  if(typeof expr === 'string') {
    return keywordTo(expr)
  }
  if(expr instanceof Map) {
    return joinTo(expr)
  }
  if(Array.isArray(expr)) {
    return identTo(expr)
  }
  if(expr instanceof Set) {
    return callTo(expr)
  }
  else {
    throw new Error('invalid expression')
  }
}

function wrap(isRoot, expr) {
  if(isRoot) {
    return withMeta(typeof expr === 'string' ? [ expr ] : expr, { 'query-root' : true })
  }
  return expr
}

export function astTo(ast, unParse = false) {

  if(ast.type === 'root') {
    return  withMeta(ast.children.map(c => astTo(c, unParse)),
      { component: ast.component })
  }
  let { key, query, queryRoot, params } = ast
  if(params) {
    return wrap(queryRoot, new Set([ astTo({ ...ast, params: undefined }, unParse), params ]))
  }
  if(ast.type === 'join') {
    if(query !== Symbol.for('...') && typeof query !== 'number' && unParse === true) {
      let { children } = ast
      if(children.length === 1 && children[0].type === 'union') {
        let unionChild = children[0].children.reduce( (o, { union, children, component }) => {
          o[union]  = withMeta([ children.map(c => astTo(c, unParse)) ], { component })
          return o
        }, {})
        return wrap(queryRoot, new Map([ [ key, unionChild ] ]))
        // return new Map([ [ key, new Map(children[0].children.map(({ union, children, component }) =>
        //   withMeta([ union, children.map(c => astTo(c, unParse)) ], { component }))) ] ])
      }
      return wrap(queryRoot, new Map([ [ key, children.map(x => astTo(x, unParse)) ] ]))
    }
    return wrap(queryRoot, new Map([ [ key, query ] ]))
  }
  return wrap(queryRoot, key)
}

function pathMeta() {

}

function noop() {}

export function getQuery(Component) {
  return withMeta((Component.query || noop)((Component.params || noop)()), { component: Component })
}

export function makeParser({ read, mutate, elidePaths }) {

  return function (env, query, target) {
    env = {
      ...env,
      parser: null, // ??
      target,
      'query-root': 'ROOTROOTROOT',
      path: env.path || [],
      get() { return this.store.getState()['_']}
    }

    function step(ret, expr) {
      let ast = exprTo(expr),
        query__ = ast.query,
        { key, dispatch, params } = ast

      let env__ = {
        ...env,
        ast,
        query: do {
          if(!query__) { undefined }
          if(query__ === Symbol.for('...')) { query }
          else query__
        },
        'query-root': Array.isArray(key) ? query : query__
      }

      let { type } = ast, isCall = type === 'call'
      let res = type === 'call' ? mutate(env__, dispatch, params) : read(env__, dispatch, params)

      if(target) {
        let ast__ = res[target]
        if(ast__ === true) {
          ret = [ ...ret, expr ]
        }
        if(isPlainObject(ast__)) {
          ret = [ ...ret, astTo(ast__) ]
        }
      }

      if(!(isCall || (ast.target === undefined) || res.hasOwnProperty('value'))) {
        return ret
      }
      let error, mutRet
      if(isCall && res.action) {
        try{
          mutRet = res.action()
        }
        catch(err) {
          error = err
        }
      }
      else {
        let { value } = res
        if(isCall) {
          if (value !== undefined && !(value instanceof Map())) {
            throw new Error('invalid mutation')
          }

        }
        if(value !== undefined) {
          ret = { ...ret, [key]: value }
        }
        if(mutRet) {
          ret = { ...ret, [key]: { ...ret[key] || {}, result: mutRet } }
        }
        if(error) {
          ret = { ...ret, [key]: { ...ret[key] || {}, '@error': error } }
        }
      }
      return ret
      // todo - path-meta
    }
    return query.reduce(step, {})

  }
}

// let p = parser({ read(env, key, params) {
//   return { value: env.state[key] }
// }, mutate(env, key, params) {

// } })

// function normalize(q, data){}

function isPrimitive(x) {
  return typeof x === 'number' ||
  typeof x === 'string' ||
  typeof x === 'boolean'

}

function find(fn) {
  for(let i=0; i< this.length; i++) {
    if(fn(this[i]))
      return this[i]
  }
}

function treeToSchema(ast, state = {}) {
  // todo - what if state doesn't exist for ast?
  // somehow need to keep marching forward
  let o = {}

  ast.children.forEach(c => {
    let st = state[c.dispatch]
    if(c.type === 'prop' && c.dispatch!== '*' && !isPrimitive(st)) {
      // s.define({ [c.dispatch]: new Schema(c.dispatch) })
    }

    if(c.type === 'join') {
      if(Array.isArray(st)) { // this might be a problem, when st doesn't exist at the moment
        if(c.children[0].type === 'union') {
          o[c.dispatch] = arrayOf(unionOf(c.children[0].children.reduce((o, x) => {
            let ss = new Schema(x.union)
            ss.define(treeToSchema(x, st::find(y => y.type === x.union)))
            o[x.union] = ss
            return o
          }, {}), { schemaAttribute: 'type' }))
        }
        else{
          let compo = c.component, idAttribute = (x => x.id), ss
          if(compo) {
            idAttribute = compo.idAttribute || idAttribute
            if(!meta(compo, 'schema')) {
              ss = new Schema(compo.ident ? compo.ident(st[0])[0] : c.dispatch, { idAttribute })
              ss.define(treeToSchema(c, st[0]))
              metaCache.set(compo, { ...metaCache.get(compo) || {}, schema: ss })
            }
            ss = meta(compo, 'schema')
          }
          else {
            ss = new Schema(c.dispatch, { idAttribute })
            ss.define(treeToSchema(c, st[0]))
          }

          o[c.dispatch] = arrayOf(ss)
        }
      }
      else {
        // todo - handle unions here
        if(c.children[0].type === 'union') {
          o[c.dispatch] = unionOf(c.children[0].children.reduce((o, x) => {
            let ss = new Schema(x.union)
            ss.define(treeToSchema(x, st)) // dangerous in this case
            o[x.union] = ss
            return o
          }, {}), { schemaAttribute: 'type' })
        }
        else {
          o[c.dispatch] = treeToSchema(c, st)
        }

      }
    }
  })
  return o
  // walk query+ state

}


export function treeToDb(q, state) {
  let ast = queryTo(q)
  let schema = treeToSchema(ast, state)
  return {
    ...normalize(state, schema),
    schema
  }
}

function schemaToTree(ast, result, entities, schema = {}) {

  let o = {}
  ast.children.forEach(c => {
    let s = schema[c.dispatch]
    if(s instanceof ArraySchema) {
      if(s._itemSchema instanceof UnionSchema) {
        let ss = s._itemSchema.getItemSchema()

        o[c.dispatch] = result[c.dispatch].map(r => {
          let cc = c.children[0].children::find(x => x.union === r.schema)
          return schemaToTree(cc, entities[r.schema][r.id], entities, ss[r.schema])
        })
      }
      else {
        o[c.dispatch] = result[c.dispatch].map(r =>  {
          return schemaToTree(c, entities[s._itemSchema.getKey()][r], entities, s)
        })
      }

    }
    else{
      // todo - * aka all attribs
      if(c.type === 'prop') {
        if(c.dispatch === '*') {
          Object.assign(o, result)
        }
        else {
          o[c.dispatch] = result[c.dispatch]
        }

      }
      else {
        o[c.dispatch] = schemaToTree(c, result[c.dispatch], entities, schema[c.dispatch])
      }
    }
  })
  return o
}

export function dbToTree(q, state, appState = state) {
  let ast = queryTo(q)
  return schemaToTree(ast, state.result, appState.entities, appState.schema)
}


// let state = {
//   foo: [ 'abc' ],
//   woz: 'boz',
//   jayjay: [ { id: 0, xyz: '123a', type: 'one', a: 1123123 }, { id: 1, xyz: '456b', type: 'two' } ],
//   foofoo: [ { id: 'a', abc: 'hjhjhj' }, { id: 'b', xyz: 'uydusd' } ],
//   maca: {
//     rena: {
//       hola: 'poopoo'
//     }
//   }
// }

// let db = treeToDb(ƒ`
//   foo
//   {all [*]}
//   [iden 1]
//   {jayjay
//     {
//       one: [a b c]
//       two: [d e f]
//     }
//   }
//   {foofoo  [id abc]}
//   { maca [{rena [hola]} dance]}
//   woz
//   `, state)


// dbToTree(ƒ`{jayjay
//     {
//       one: [*]
//       two: [d e f]
//     }
//   }`, db.result, db)::log()

// ƒ`
//   foo
//   {all [*]}
//   [iden 1]
//   {jayjay
//     {
//       one: [a b c]
//       two: [d e f]
//     }
//   }
//   {foofoo  [id abc]}
//   { maca [{rena [hola]} dance]}
//   woz
//   `::log()

// dbToTree(ƒ`{foofoo [id abc]}`, db.result, db)::log()


// normalize(state, s)::print()

// function exec(remote) {
//   // console.log(this)
//   return p({ state }, this, remote)
// }
// let exec = (remote) => p({ state }, query, remote)

// ƒ`[foo 0]`::log()

// // prop
// astTo(queryTo(ƒ`foo`))::log()

// // prop + params
// astTo(queryTo(ƒ`'foo {arg 123}`))::log()

// // join + sub-select
// astTo(queryTo(ƒ`{key [sub]}`))::log()

// // recursive join
// astTo(queryTo(ƒ`key1 key2 {some ...}`))::log()

// // join + params
// astTo(queryTo(ƒ`'{somekey [subkey]} { arg 1 }`))::log()

// // reference / ident
// astTo(queryTo(ƒ`[post 1234]`))::log()

// // union
// astTo(queryTo(ƒ`{ items {photo : [id title image] post: [id title post] } }`))::log()

// astTo(queryTo(ƒ`{[byId 1] [age]}{[byId 3] [name]}`))::log()

// ;; Reads
// [:some/key] ;; property read
// [(:some/key {:some/param 42})] ;; parameterized property read

// [{:some/key [:subkey/one :subkey/two]}] ;; join
// '[{:some/key [*]}] ;; join (read all subkeys)
// [({:some/key [:subkey/one :subkey/two]} {:some/param 42})] ;; parameterized join

// [[:item/by-id 0]] ;; ident reference
// '[[:active/panel _]] ;; link reference

// [{:items/list {:foo [:item/id :item/type :foo/value]
//                :bar [:item/id :item/type :bar/value]}}] ;; union query

// '[{:tree [:id :value {:children ...}]}] ;; recursive query
// [{:tree [:id :value {:children 5}]}] ;; recursive query with recursion limit

// '[{:tree {:node/foo [:id :node/type :foo/value {:children ...}]
//           :node/bar [:id :node/type :bar/value {:children ...}]}}] ;; recursive union query
// [{:tree {:node/foo [:id :node/type :foo/value {:children 5}]
//          :node/bar [:id :node/type :bar/value {:children 5}]}}] ;; recursive union query with recursion limit


// read(data, ƒ`items`)::log()

// [(fire-missiles!)]                       ;;mutation
// [(fire-missiles! {:target :foo})]        ;;mutation + params
// { :photo [...subquery...]
//   :video [...subquery...]
//   :comment [...subquery...] }

