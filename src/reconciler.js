import { render, unmountComponentAtNode } from 'react-dom'
import React from 'react'

import { Root, makeStore } from './root'
import { getQuery, log, bindParams, makeParser } from './ql'
import { take } from 'redux-saga/effects'

export const ACTIONS = {
  register: 'disto.register',
  fromHistory: 'disto.fromHistory',
  setParams: 'disto.setParams',
  setQuery: 'disto.setQuery',
  remoteSend: 'disto.remoteSend',
  merge: 'disto.merge',
  setState: 'disto.setState'

}

function * saga(_, r) {
  while(true) {
    yield take('disto.merge') // next tick?
    r.refresh()
  }
}


export class Reconciler {
  constructor({
    parser,
    store,
    read,
    mutate,
    normalize = true,
    remotes = [],
    reduce = (x = {}) => x,
    middleware,
    send = () => {}
  }) {
    this.env = {
      normalize,
      parser: parser || makeParser({ read, mutate }),
      remotes,
      store: store && typeof store.dispatch === 'function' ? store : makeStore(store, reduce, middleware),
      send
      // getState: () => this.env.store.getState(),
    }
    window.$$$ = this // why not
  }

  read(query, remote) {
    // remotes etc
    let answer = this.env.parser(this.env, query)
    if(remote && this.env.remotes.length > 0) {

      let remotes = this.env.remotes.reduce((o, r) => (o[r] = this.env.parser(this.env, query, r), o), {})
      this.env.store.dispatch({ type: ACTIONS.remoteSend, payload: { remotes } })
      this.env.send(remotes, (err, data) => data && this.merge(data))
    }
    return answer
  }

  // *!*
  register(instance, klass, p = instance.props) {

    let qp = klass.params ? klass.params() : undefined,
      id = klass.ident ? klass.ident(p) : undefined,
      q = klass.query ? klass.query(this, p) : undefined,
      data = {
        ident: id,
        query: q,
        params: qp
      }

    this.env.store.dispatch({ type: ACTIONS.register, payload: { component: instance, data } })
    // update indices
  }

  // *!*
  add(Component, element) {
    this.element = element
    this.Component = Component
    let answer = this.read(getQuery(Component), true)
    render(<Root
      ref={r => this.baseRoot = r}
      answer={answer}
      store={this.env.store}
      reconciler={this}
      Component={Component}
    />, element)

    this.saga = this.env.store.sagas.run(saga, this)
  }

  // *!*
  remove() {
    this.saga.cancel()
    unmountComponentAtNode(this.element)
    delete this.root
    delete this.saga

  }
  // *!*
  transact(action, query, remote = true) { // query === keys to refresh
    // knowing that ut
    this.env.store.dispatch(action)
    this.refresh()
    if(query) {
      this.read(query, remote) // just for the side effect
    }
  }

  refresh(remote) {
    let c = this.env.store.getState().components.get(this.root)
    // let answer =
    this.baseRoot.setAnswer(this.read(bindParams(c.query, c.params), remote))

  }

  // *!*
  setParams(component, params, remote = true) {
    this.env.store.dispatch({ type: ACTIONS.setParams, payload: { component, params } })
    this.refresh(remote)
  }
  // *!*
  setQuery(component, query, params, remote = true) {
    this.env.store.dispatch({ type: ACTIONS.setQuery, payload: { component, query, params } })
    this.refresh(remote)
  }

  // *!*
  setState(component, state) {
    this.env.store.dispatch({ type: ACTIONS.setState, payload: { component, state } })
  }

  // *!*
  merge(payload) {
    this.env.store.dispatch({ type: ACTIONS.merge, payload })
  }

  // getState = () => {
  //   return this.store.getState()
  // }

  setRoot(instance) {
    this.root = instance
  }

  fromHistory(r, uuid) {
    this.store.dispatch({ type: ACTIONS.fromHistory, payload: uuid })
  }

}


export function makeReconciler(config) {
  return new Reconciler(config)
}

