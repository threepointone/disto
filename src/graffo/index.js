import { parse } from './parser'
import isPlainObject from 'lodash.isplainobject'

function ƒ(strings, ...values) {
  return parse('[' + strings.reduce((arr, s, i) => [ ...arr, s, values[i] ], []).join('') + ']')
  // this will be modified to handle
  // arrays
}

function log() {
  console.log(this) // eslint-disable-line no-console
  return this
}

function print() {
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
      target: meta(call, 'target')|| 'remote'
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

let metaCache = new WeakMap()

function meta(o, k) {
  if(typeof o === 'symbol' || typeof o === 'string' || typeof o === 'number') {
    return
  }
  if(!metaCache.has(o)) {
    metaCache.set(o, {})
  }
  return metaCache.get(o)[k]
}

function withMeta(o, m) {
  // only for objects!
  let newObj = Array.isArray(o) ? [ ...o ] : { ...o } // sets, maps?
  metaCache.set(newObj, m)
  return newObj
}

function queryTo(query) {
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

function exprTo(expr) {
  // expr::log()
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

function astTo(ast, unParse = false) {

  if(ast.type === 'root') {
    return  withMeta(ast.children.map(c => astTo(c, unParse)),
      { component: meta(ast, 'component' ) })
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

function parser({ read, mutate, elidePaths }) {

  return function (env, query, target) {
    env = {
      ...env,
      parser: null, // ??
      target,
      'query-root': 'ROOTROOTROOT',
      path: env.path || []
    }

    function step(ret, expr) {
      let ast = exprTo(expr),
        query__ = ast.query,
        { key, dispatch, params } = ast

      let env__ = {
        ...env,
        ast,
        query: do {
          if(!query) { undefined }
          if(query === Symbol.for('...')) { query }
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
        if(ast__ instanceof Map) {
          ret = [ ...ret, astTo(ast__) ]
        }
      }

      if(!(isCall || (ast.target === undefined) || res.value)) {
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
        if(value) {
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


// // // prop
astTo(queryTo(ƒ`foo`))::log()

// // // prop + params
astTo(queryTo(ƒ`'foo {arg 123}`))::log()

// // // join + sub-select
astTo(queryTo(ƒ`{key [sub]}`))::log()

// // // recursive join
astTo(queryTo(ƒ`key1 key2 {some ...}`))::log()

// // // join + params
astTo(queryTo(ƒ`'{somekey [subkey]} { arg 1 }`))::log()

// // // // reference / ident
astTo(queryTo(ƒ`[post 1234]`))::log()

// // // // union
astTo(queryTo(ƒ`{ items {photo : [id title image] post: [id title post] } }`))::log()

astTo(queryTo(ƒ`{[byId 1] [age]}{[byId 3] [name]}`))::log()

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

