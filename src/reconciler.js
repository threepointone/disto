import { render, unmountComponentAtNode } from 'react-dom'
import React from 'react'

import { Root, makeStore } from './root'
import { getQuery, log } from './graffo'

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
      store: store.dispatch ? store : makeStore(reducers, store, middleware),
      getState: () => this.env.store.getState()
    }
    window.$$$ = this
  }

  read(query) {
    // remotes etc
    return this.env.parser(this.env, query)
  }

  // *!*
  register(instance) {
    console.log('register', instance)
    // update indices
  }

  // *!*
  add(Component, element) {
    this.element = element
    this.Component = Component
    let answer = this.read(getQuery(Component))
    render(<Root
      answer={answer}
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
  transact(action, query) { // query === keys to refresh
    this.env.store.dispatch(action)
    let element = this.element
    let Component = this.Component
    let answer = this.read(getQuery(Component))
    render(<Root
      answer={answer}
      store={this.env.store}
      reconciler={this}
      ref={r => this.root = r}>
      <Component/>
    </Root>, element)
    // desc.effect()
    // component.refresh({})
  }

  // *!*
  merge(payload) {
    this.store.dispatch({ type: ACTIONS.merge, payload })
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
