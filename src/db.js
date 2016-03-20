import { exprToAst, bindVariables, queryToAst, astToExpr } from './ql'

import isPlainObject from 'lodash.isplainobject'

import { withMeta, meta, cache } from './meta'

import { Schema, normalize, arrayOf, unionOf } from 'normalizr'

import ArraySchema from 'normalizr/lib/IterableSchema'
import UnionSchema from 'normalizr/lib/UnionSchema'

import { log } from './util'


function pathMeta() { // eslint-disable-line

}

function noop() {}

export function getQuery(Component, props) {
  // params
  let q = (Component.query || noop)(null, props)
  if(Component.variables) {
    q = bindVariables(q, Component.variables())
  }
  return withMeta(q, { component: Component })
}

export function makeParser({ read, mutate, elidePaths }) { // eslint-disable-line
  return function (env, query, target) {
    env = {
      ...env,
      parser: null, // ??
      target,
      'query-root': Symbol.for('disto.root'),
      path: env.path || [],
      get() { return this.store.getState()['_']}
    }

    if(isPlainObject(query)) {
      // mutation

      let action = { ...query, env },
        res = mutate(env, action)
      if(target) {
        if(res[target] === true)
          return action
        else
          return res[target]
      }

      // let error, result
      if(res.effect) {
        try{
          let result = res.effect()
          if(result != undefined) {
            return { result }
          }
        }
        catch(error) { return { error } }
      }
      return
    }

    // else read
    return query.reduce((ret, expr) => {
      let ast = exprToAst(expr),
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

      let res = read(env__, dispatch, params)

      if(target) {
        let ast__ = res[target]
        if(ast__ === true) {
          ret = [ ...ret, expr ]
        }
        if(isPlainObject(ast__)) {
          ret = [ ...ret, astToExpr(ast__) ]
        }
      }

      if(!((ast.target === undefined) || res.hasOwnProperty('value'))) {
        return ret
      }

      else {
        let { value } = res
        if(value !== undefined && !target) {
          ret = { ...ret, [key]: value }
        }
      }
      return ret
      // todo - path-meta
    }, target ? [] : {})

  }
}


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
          let compo = c.component, idAttribute = (x => x.id), schemaAttribute = (x => x.type), ss
          if(compo) {
            // this has to be up there too
            if(!meta(compo, 'schema')) {
              ss = new Schema(compo.ident ? compo.ident(st[0])[0] : c.dispatch,
                { idAttribute: compo.ident ? (x => compo.ident(x)[1]) : idAttribute, schemaAttribute })
              ss.define(treeToSchema(c, st[0]))
              cache.set(compo, { ...cache.get(compo) || {}, schema: ss })
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


export function treeToDb(q, state, mergeIdents = true) {
  let ast = queryToAst(q)
  let schema = treeToSchema(ast, state)
  let normalized = normalize(state, schema)
  return {
    ...normalized.result,
    ...mergeIdents ? normalized.entities : {},
    schema
  }
}

function schemaToTree(ast, state, appState, schema = {}) {
  let o = {}
  ast.children.forEach(c => {
    let s = schema[c.dispatch]    // what if schema is a real schema?

    if(s instanceof ArraySchema) {
      if(s._itemSchema instanceof UnionSchema) {
        let ss = s._itemSchema.getItemSchema()

        o[c.dispatch] = state[c.dispatch].map(r => {
          let cc = c.children[0].children::find(x => x.union === r.schema)
          return schemaToTree(cc, appState[r.schema][r.id], appState, ss[r.schema])
        })
      }
      else {
        o[c.dispatch] = state[c.dispatch].map(r =>  {
          return schemaToTree(c, appState[s._itemSchema.getKey()][r], appState, s)
        })
      }

    }
    else{

      if(c.type === 'prop') {
        if(Array.isArray(c.key)) {

          // ident
          o[c.dispatch] = appState[c.dispatch]
          if(c.key[1] !== '_') {
            o[c.dispatch] = o[c.dispatch][c.key[1]]
          }
        }
        else if(c.dispatch === '*') {
          Object.assign(o, state)
        }
        else {
          o[c.dispatch] = state[c.dispatch]
        }

      }
      else {
        o[c.dispatch] = schemaToTree(c, state[c.dispatch], appState, schema[c.dispatch])
      }
    }
  })
  return o
}

// todo - handle remotes?
export function dbToTree(q, state, appState = state) {
  let ast = queryToAst(q)
  return schemaToTree(ast, state, appState, appState.schema)
}

export function subquery(component, ref, klass, props) {
  if(component && component.references[ref]) {
    return component.context.disto.store.getState().components.get(component.refs[ref]).query
  }

  else {
    return getQuery(klass, props)
  }
}
