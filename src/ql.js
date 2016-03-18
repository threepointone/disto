import { parse } from './parser.js'
import isPlainObject from 'lodash.isplainobject'

import { withMeta, meta } from './meta'

function randomStr() {
  let s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", N = 16
  return Array(N).join().split(',').map(() =>  s.charAt(Math.floor(Math.random() * s.length)) ).join('')
}


export function ql(strings, ...values) {
  let refs = {}, parsed = parse(strings.reduce((arr, s, i) => {
      let v = values[i]

      let isQ = Array.isArray(v) || isPlainObject(v), rando = randomStr()
      if(isQ) {
        refs[rando] = v
        v = '[ ' + rando + ' ]'
      }
      return [ ...arr, s, v ]
    }, []).join(''))

  let replaced = qlreplace(parsed, refs)
  return replaced

}

function qlreplace(q, refs) {
  if(typeof q === 'symbol') {
    return q
  }

  if(typeof q[0] === 'string' && q.length === 1 && refs[q[0]]) {
    if(isPlainObject(refs[q[0]])) {
      return Object.keys(refs[q[0]]).reduce((o, k) =>
        (o[k] = qlreplace(refs[q[0]][k], refs) ,o), {})
    }
    return withMeta(qlreplace(refs[q[0]], refs), { component: meta(refs[q[0]], 'component') })
  }
  return q.map(expr => {
    if(typeof expr === 'string' || typeof expr === 'number' || Array.isArray(expr) || typeof expr === 'symbol') { // symbol? ident?
      return expr
    }
    if(expr instanceof Set) {
      let [ e, params ] = [ ...expr.values() ]
      return new Set([  qlreplace([ e ], refs)[0], params ] )
    }

    if(expr instanceof Map) {
      // join
      return new Map([ ...expr.entries() ].map(([ k, v ]) => {
        if(isPlainObject(v)) {
          // union
          return [ k, Object.keys(v).reduce((o, kk) => (o[kk] = qlreplace(v[kk], refs) ,o), {}) ]
        }
        return [ k, qlreplace(v, refs) ]
      }))
    }
  })
}

export function bindVariables(q, variables) {
  if(typeof q === 'symbol') {
    return variables[Symbol.keyFor(q)]
  }
  // cycle through, replace symbol params with actual param values
  return withMeta(q.map(expr => {
    if(expr instanceof Set) {
      let [ e, pps ] = [ ...expr.values() ]
      return new Set([ bindVariables([ e ], variables)[0],
        Object.keys(pps).reduce((o, p) => (o[p] = typeof pps[p] === 'symbol' ? variables[Symbol.keyFor(pps[p])] : pps[p], o),{})
      ])

    }
    if(expr instanceof Map) {
      let [ e, qq ] = [ ...expr.entries() ][0]

      return new Map([ [ bindVariables([ e ], variables)[0], (Array.isArray(qq) || (typeof qq === 'symbol')) ? bindVariables(qq, variables) :
        Object.keys(qq).reduce((o, qqq) => (o[qqq] = bindVariables(qq[qqq], variables), o), {}) ] ])
    }
    if(typeof expr === 'symbol' && expr !== Symbol.for('...')) {
      return variables[Symbol.keyFor(expr)]
    }
    else return expr
  }), { component: meta(q, 'component') })
}

function symbolToAst(sym) {
  return {
    dispatch: sym,
    key: sym
  }
}

function keywordToAst(k) {
  return {
    type: 'prop',
    dispatch: k,
    key: k
  }
}

function unionEntryToAst([ k, v ]) {
  return  {
    type: 'union-entry',
    union: k,
    query: v,
    children: v.map(exprToAst),
    component: meta(v, 'component')
  }

}

function unionToAst(m) {
  return {
    type: 'union',
    query: m,
    children: Object.entries(m).map(unionEntryToAst)
  }
}

function callToAst(call) {
  let [ f, args ] = call
  // call = [ f, args ]

  if(typeof f === 'symbol') {
    return {
      ...exprToAst(args),
      target: meta(call, 'target') || 'remote'
    }
  }
  let ast  = exprToAst(f)
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

export function queryToAst(query) {
  return  {
    type: 'root',
    children: query.map(exprToAst),
    component: meta(query, 'component')
  }
}

function joinToAst(j) {
  let [ k, v ] = [ ...j.entries() ][0],
    ast = exprToAst(k)

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
        children: v.map(exprToAst)
      }
    }
    else if(isPlainObject(v)) {
      ast = {
        ...ast,
        children: [ unionToAst(v) ]
      }
    }
    else {
      throw new Error('Invalid Join', j)
    }
  }
  return ast
}

function identToAst(i) {
  return {
    type: 'prop',
    dispatch: i[0],
    key: i
  }
}

export function exprToAst(expr) {
  if(typeof expr === 'symbol') {
    return symbolToAst(expr)
  }
  if(typeof expr === 'string') {
    return keywordToAst(expr)
  }
  if(expr instanceof Map) {
    return joinToAst(expr)
  }
  if(Array.isArray(expr)) {
    return identToAst(expr)
  }
  if(expr instanceof Set) {
    return callToAst(expr)
  }
  else {
    throw new Error('invalid expression', expr)
  }
}

function wrap(isRoot, expr) {
  if(isRoot) {
    return withMeta(typeof expr === 'string' ? [ expr ] : expr, { 'query-root' : true })
  }
  return expr
}

export function astToExpr(ast, unParse = false) {

  if(ast.type === 'root') {
    return  withMeta(ast.children.map(c => astToExpr(c, unParse)),
      { component: ast.component })
  }
  let { key, query, queryRoot, params } = ast
  if(params) {
    return wrap(queryRoot, new Set([ astToExpr({ ...ast, params: undefined }, unParse), params ]))
  }
  if(ast.type === 'join') {
    if(query !== Symbol.for('...') && typeof query !== 'number' && unParse === true) {
      let { children } = ast
      if(children.length === 1 && children[0].type === 'union') {
        let unionChild = children[0].children.reduce( (o, { union, children, component }) => {
          o[union]  = withMeta([ children.map(c => astToExpr(c, unParse)) ], { component })
          return o
        }, {})
        return wrap(queryRoot, new Map([ [ key, unionChild ] ]))
        // return new Map([ [ key, new Map(children[0].children.map(({ union, children, component }) =>
        //   withMeta([ union, children.map(c => astToExpr(c, unParse)) ], { component }))) ] ])
      }
      return wrap(queryRoot, new Map([ [ key, children.map(x => astToExpr(x, unParse)) ] ]))
    }
    return wrap(queryRoot, new Map([ [ key, query ] ]))
  }
  return wrap(queryRoot, key)
}

