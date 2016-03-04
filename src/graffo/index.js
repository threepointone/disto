import { parse } from './parser'
import isPlainObject from 'lodash.isplainobject'

function ƒ(strings, ...values) {
  return parse('[' + strings.reduce((arr, s, i) => [ ...arr, s, values[i] ], []).join('') + ']')
  // this will be modified to handle
  // arrays
}

function log(x) {
  console.log(this, x || '') // eslint-disable-line no-console
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
    key: i[1]
  }
}

function exprTo(expr) {
  expr::log()
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
    return wrap(queryRoot, new Set(astTo({ ...ast, params: null }), unParse), params)
  }
  if(ast.type === 'join') {
    if(query !== Symbol.for('...') && typeof query !== 'number' && unParse === true) {
      let { children } = ast
      if(children.length === 1 && children[0].type === 'union') {
        return new Map([ [ key, new Map(children[0].children.map(({ union, children, component }) =>
          withMeta([ union, children.map(c => astTo(c, unParse)) ], { component }))) ] ])
      }
      return
    }
    return new Map([ key, query ])
  }
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

queryTo(ƒ`foo`)::print()

// // prop
queryTo(ƒ`foo`)::print()

// // prop + params
queryTo(ƒ`'foo {arg 123}`)::print()

// // join + sub-select
queryTo(ƒ`{key [sub]}`)::print()

// // // recursive join
// ƒ`key1 key2 {some ...}`::log()

// // // join + params
queryTo(ƒ`'{somekey [subkey]} { arg 1 }`)::print()

// // // reference / ident
queryTo(ƒ`[post 1234]`)::print()

// // // union
queryTo(ƒ`{ items {photo : [id title image] post: [id title post] } }`)::print()

queryTo(ƒ`{[byId 1] [age]}{[byId 3] [name]}`)::print()

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



// ƒ('')










// parser = function({read, mutate}){
//   return function(query, {state}, ){
//     // if vector, read
//     // else, mutation
//   }
// }












// export class Db{

// }


// export function treeToDb(Component, tree, db = new Db()) {
//   let entitys = db.entitys

//   let q = Component.query()
//   let Entity = { key: q.dispatch }
//   Entity.fields = q.fields
//   if(q.type === 'prop'){
//     // no more information
//     // and we can just put the data into the db
//     db = db.set(q.dispatch, '_', tree)
//   }
//   else if(q.type === 'ident') {
//     // like prop, but with a possible id
//     // return db.set(q.dispatch, q.ident[1], data)
//     // can't set data just yet, but we know it's a collection
//     Entity.type = 'collection'
//     // do we know if it's a reference? not yet

//     // what is id attribute though?
//     // dunno yet frankly
//     // db = db.set(q.ident[0], '_', tree)
//     for( let el, i of tree) {
//       db = db.set(q.ident[0], i, el)
//     }
//   }

//   else if(q.type === 'join'){
//     Entity.type === 'collection'
//     if !isComponent(q.children){
//       for( let el, i of tree) {
//         db = db.set(q.ident[0], i, el)
//       }
//       else {
//         // recurse
//         for(let el, i of tree) {
//           db = db.set(q.ident[0], i, q.children.ident(el))
//           db = treeToDb(q.children, el, db)

//         }


//       }


//     }

//   }


//   // Entitys[q.dispatch]  =


// }

// export function dbToTree(Component, tree){

// }