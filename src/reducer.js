export default function reducer(fn) {
  return function (state = fn(undefined, { type: '@@disto/probe' }), action) {
    if(action.type === 'disto:remoteSend') {
      return {
        ...state,
        ...action.payload || {}
      }
    }

    return fn(state, action)
  }
}

function mapMap(m, fn) {
  return new Map([ ...m.entries() ].map(fn))
}

function setMap(m, key, value) {
  return mapMap(m, ([ k, v ]) => [ k, k === key ? value: v ])
}

function delMap(m, key) {
  return new Map([ ...m.entries() ].filter(([ k, v ]) => k !== key))
}

export function components( state = new Map(), { type, payload }) { // weakmap?
  switch(type) {
    case 'disto.register': return setMap(state, payload.component, payload.data || {}) // need to pick query ident params
    case 'disto.setIdent': return setMap(state, payload.component, { ...state.get(payload.component), ident: payload.ident })
    case 'disto.setParams': return setMap(state, payload.component, { ...state.get(payload.component), params: payload.params })
    case 'disto.setQuery': return setMap(state, payload.component, { ...state.get(payload.component), query: payload.query })
    case 'disto.unregister': return delMap(state, payload.component)
  }
  return state
  // disto.register
  // disto.setParams
  // disto.setQuery
}
