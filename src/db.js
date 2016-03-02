import { Schema, arrayOf, normalize } from 'normalizr'

function memoize(fn, c = new WeakMap(), hasher = i => i) {
  return (...args) => {
    let hash = hasher(...args)
    if(c.has(hash)) {
      return c.get(hash)
    }
    c.set(hash, fn(...args))
    return c.get(hash)
  }
}

export const schemaFor = memoize((Component) => {
  return new Schema(Component.ident()[0], { idAttribute: Component.ident()[1] })
}, new Map())


function zipUpdateIn(o, state, [ head, ...tail ], fn) {
  if(tail.length === 0) {
    return { ...o, [head]: fn(state[head]) }
  }
  return { ...o, [head]: zipUpdateIn(o[head], state[head], tail, fn) }
}


// PROTIP read is called only when it's not already in the database

export function treeTodb(queryOrComponent, state, merge = false) {
  let edges
  if(typeof queryOrComponent === 'function') {
    edges = queryOrComponent.query().edges
  }
  else {
    edges = queryOrComponent.edges
  }

  let schema = edges.reduce((o, [ path, Component ]) =>
    zipUpdateIn(o, state, path, val =>
      Array.isArray(val) ? arrayOf(schemaFor(Component)) : null
    ), {})

  let normalized = normalize(state, schema)
  if(merge) {
    return {
      _: { ...state, ...normalized }
    }
  }
  return {
    _: normalized
  }
}

export function dbToTree(query, data, appData){
  // denormalize
}
