import { render, unmountComponentAtNode } from 'react-dom'
import React from 'react'

import { Root, makeStore } from './root'

export const ACTIONS = {
  merge: 'disto.reconciler.merge',
  fromHistory: 'disto.reconciler.fromHistory'

}


export class Reconciler {
  constructor({
    parser,
    state = {},
    initial = {},
    normalize = true,
    remotes = [],
    send = (remotes, next) => {},
    reducers = {},
    middleware
  }) {
    this.env = {
      parser,
      state,
      remotes,
      send,
      store: makeStore(reducers, initial, middleware)
    }
  }

  read(query) {
    // remotes etc
    let result = this.env.parser.read(this.env, query)
    return Object.keys(result)
      .reduce((o, key) => (o[key] = result[key].value, o), {})
  }

  register(instance) {
    // update indices
  }

  // *!*
  add(Component, element) {
    render(<Root store={this.env.store} reconciler={this} ref={r => this.root = r}><Component/></Root>, element)
  }

  // *!*
  remove(element) {
    unmountComponentAtNode(element)
    delete this.root

  }
  // *!*
  transact(component, action, keys) {
    let desc = this.env.parser.mutate(this.env, action, keys)
    // this.env.store.dispatch(action)
    desc.effect()
    // component.refresh({})
  }

  // *!*
  merge(novelty) {
    this.store.dispatch({ type: ACTIONS.merge, payload: novelty })
  }

  getState() {
    return this.store.getState().disto
  }

  getRoot() {
    return this.root
  }

  fromHistory(r, uuid) {
    this.store.dispatch({ type: ACTIONS.fromHistory, payload: uuid })
  }

}


export function make(config) {
  return new Reconciler(config)
}

