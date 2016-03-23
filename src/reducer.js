import { log } from './util.js'

export default function reducer(fn) {
  let exported = function (state = fn(undefined, { type: '@@disto/probe' }), action) {

    if(action.type === 'disto.merge') {
      return {
        ...state,
        ...action.payload(state) || {}
      }
    }
    else if(action.type === 'disto.swap') {
      return action.payload(state)
    }

    else {
      return fn(state, action)
    }
  }
  return exported
}

function without(obj, key) {
  return Object.keys(obj).reduce((o, k) => {
    if (k!== key) {
      return { ...o, [k]: obj[k] }
    }
    return o
  }, {})
}


function setMap(m, key, value) {
  let mm = new Map(m.entries()) // mapMap(m)
  mm.set(key, value)
  return mm
}

function delMap(m, key) {
  let mm = new Map(m.entries())
  mm.delete(key)
  return mm
}

function replaceInArray(arr, pos, val) {
  return [ ...arr.slice(0, pos),  val, ...arr.slice(pos+1) ]
}

function updateIn(arr, path, fn) {
  let i = arr::findIndex(c => {
    return comparePaths(c[0], path)
  })
  return replaceInArray(arr, i, fn(arr[i]))
}

export function components( state = [], { type, payload }) { // weakmap?
  switch(type) {
    case 'disto.register':
      // todo - don't register if already 'exists'
      return [ ...state, payload ]
    // case 'disto.setIdent':
    //   return setMap(state, payload.component, { ...state.get(payload.component), ident: payload.ident })
    // case 'disto.setState':
    //   return setMap(state, payload.component, { ...state.get(payload.component), state: payload.state })
    case 'disto.setVariables':
      return updateIn(state, payload.path, c => [ c[0], { ...c[1], ...payload } ])
    case 'disto.setQuery':
      return updateIn(state, payload.path, c => [ c[0], { ...c[1], ...payload } ])
    // case 'disto.unregister':
    //   return []delMap(state, payload.component)
  }
  return state
}

// export function txns(state = {}, action) {
//   // if marked with transaction.start
// }


function comparePaths(a, b) {
  let matches = true
  if(a.length !== b.length) {
    return false
  }
  for(let i= 0; i< a.length; i++) {
    if(a[i][0] !== b[i][0] && a[i][1] !== b[i][1]) {
      matches = false
      break
    }
  }
  return matches
}

function findIndex(fn) {
  for(let i = 0; i< this.length; i++) {
    if(fn(this[i])) {
      return i
    }
  }
}
