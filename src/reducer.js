export default function reducer(fn) {
  return function (state = fn(undefined, { type: '@@disto/probe' }), action) {
    if(action.type === 'disto.merge') {
      return {
        ...state,
        ...action.payload || {}
      }
    }
    if(action.type === 'disto.swap') {
      return action.payload
    }

    return fn(state, action)
  }
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

export function components( state = new Map(), { type, payload }) { // weakmap?
  switch(type) {
    case 'disto.register':
      return setMap(state, payload.component, payload.data || {})
    // case 'disto.setIdent':
    //   return setMap(state, payload.component, { ...state.get(payload.component), ident: payload.ident })
    case 'disto.setState':
      return setMap(state, payload.component, { ...state.get(payload.component), state: payload.state })
    case 'disto.setVariables':
      return setMap(state, payload.component, { ...state.get(payload.component), variables: payload.variables })
    case 'disto.setQuery':
      return setMap(state, payload.component, { ...state.get(payload.component), query: payload.query, variables: payload.variables })
    case 'disto.unregister':
      return delMap(state, payload.component)
  }
  return state
}
