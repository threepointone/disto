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
    store = {},
    normalize = true,
    remotes = [],
    send = (remotes, next) => {},
    reducers = {},
    middleware
  }) {
    this.env = {
      parser,
      remotes,
      send,
      store: store.dispatch? store : makeStore(reducers, store, middleware),
      getState: () => this.env.store.getState()
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
    render(<Root
      store={this.env.store}
      reconciler={this}
      ref={r => this.root = r}>
      <Component/>
    </Root>, element)
  }

  // *!*
  remove(element) {
    unmountComponentAtNode(element)
    delete this.root

  }
  // *!*
  transact(component, action, keys) {
    let desc = this.env.parser.mutate(this.env, action, keys)
    desc.effect()
    // component.refresh({})
  }

  // *!*
  merge(novelty) {
    this.store.dispatch({ type: ACTIONS.merge, payload: novelty })
  }

  getState = () => {
    return this.store.getState()
  }

  getRoot() {
    return this.root
  }

  fromHistory(r, uuid) {
    this.store.dispatch({ type: ACTIONS.fromHistory, payload: uuid })
  }

}


export function makeReconciler(config) {
  return new Reconciler(config)
}

// export function addRoot(r, ) {

// }