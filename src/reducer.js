import { log } from './util.js'

export default function reducer(fn) {
  let exported = function (state = fn(undefined, { type: '@@disto/probe' }), action) {

    if(action.type === 'disto.merge') {
      return {
        ...state,
        ...action.payload(state) || {},
        txns: state.txns || {}
      }
    }
    else if(action.type === 'disto.swap') {
      return { ...action.payload(state), txns: state.txns || {} }
    }
    else if(action.type === 'disto.optimistic.start') {
      state = { ...state, txns: { ...state.txns || {}, [action.payload.id] : { state, actions: [] } } }

    }

    else if(action.type === 'disto.optimistic.revert') {
      // state::log()
      let key = action.payload.id
      if(!state.txns[key]) {
        console.warn(state.txns, key)
        return state
      }
      let st = state.txns[key].state,
        actions = state.txns[key].actions

      let start = 0
      while (start < actions.length &&
        actions[start].type!== 'disto.optimistic.stop' &&
        actions[start].payload.id !== key) {
        start ++
      }

      while(start < actions.length) {
        // st::log()
        st = exported(st, actions[start])
        start ++
      }


      state = st
      state = {
        ...state,
        txns: state.txns::without(key)
      }
      // return state


      // start with state
      // skip until optimistic.stop
      // 'replay' the rest
      // remove from txns
      // carry on

    }

    else {
      state = fn(state, action)
    }


    let txns = state.txns || {}
    Object.keys(txns).forEach(key =>
      state = {
        ...state,
        txns: {
          ...txns,
          [key]: {
            ...txns[key] || {},
            actions: [ ...(txns[key] || {}).actions || [], action ]
          }
        }
      }
    )
    return state
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
