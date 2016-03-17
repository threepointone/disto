import { render, unmountComponentAtNode } from 'react-dom'
import React from 'react'
import { BEGIN, COMMIT, REVERT } from 'redux-optimist'

import { Root, makeStore } from './root'
import { getQuery, log, bindParams, makeParser } from './ql'
import { take } from 'redux-saga/effects'

export const ACTIONS = {
  register: 'disto.register',
  unregister: 'disto.unregister',
  fromHistory: 'disto.fromHistory',
  setParams: 'disto.setParams',
  setQuery: 'disto.setQuery',

  merge: 'disto.merge',
  remoteSend: 'disto.remoteSend',
  setState: 'disto.setState'

}

// function * saga(_, r) {
//   while(true) {
//     yield take('disto.refresh') // next tick?
//     r.refresh()
//   }
// }


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
    global.$$$ = this // dev only, why not
  }

  get() {
    return this.env.store.getState()._
  }

  // *!*
  read(query, remote) {
    // remotes etc
    let answer = this.env.parser(this.env, query)
    if(remote && this.env.remotes.length > 0) {

      let remotes = this.env.remotes.reduce((o, r) => (o[r] = this.env.parser(this.env, query, r), o), {})
      this.env.store.dispatch({ type: ACTIONS.remoteSend, payload: { remotes } })
      let d = {}
      d.merge = data => this.merge(data)
      d.optimistic = (...args) => this.optimistic(null, ...args)
      d.transact = (...args) => this.transact(null, ...args)
      this.env.send(remotes, d)
    }
    return answer
  }

  // *!*
  register(instance, klass, p = instance.props) {

    let qp = klass.params ? klass.params() : undefined,
      id = klass.ident ? klass.ident(p) : undefined,
      q = klass.query ? klass.query(instance, p) : undefined,
      data = {
        ident: id,
        query: q,
        params: qp
      }

    this.env.store.dispatch({ type: ACTIONS.register, payload: { component: instance, data } })
    // update indices
  }
  unregister(instance) {
    this.env.store.dispatch({ type: ACTIONS.unregister, payload: { component: instance } })
  }

  // *!*
  add(Component, element) {
    this.element = element
    this.Component = Component
    let answer = this.read(getQuery(Component), true)
    render(this.createElement(Component, answer), element)
  }

  createElement(Component, answer) {
    return <Root
      ref={r => this.baseRoot = r}
      answer={answer}
      store={this.env.store}
      reconciler={this}
      Component={Component}
    />
  }

  // *!*
  remove() {

    unmountComponentAtNode(this.element)
    delete this.root
    delete this.baseRoot

  }
  // *!*
  transact(component, action, query, remote = true) { // query === keys to refresh
    // knowing that ut
    this.env.store.dispatch(action)
    this.refresh()
    if(query) {
      this.read(query, remote) // just for the side effect
    }
  }

  // *!*
  refresh(remote) {

    if(!this.root) {
      // console.warn('root missing?')   // eslint-disable-line no-console
      return

    }
    let c = this.env.store.getState().components.get(this.root)
    let answer = this.read(bindParams(c.query, c.params), remote)

    if(!this.baseRoot) {
      console.warn('base root missing?')  // eslint-disable-line no-console
    }
    else {
      this.baseRoot.setAnswer(answer)
    }

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
    this.refresh()
  }

  transactionID = 0
  optimistic(component, action, query, remote) {
    // we don't really use component, just for consistency
    const id = this.transactionID++
    this.transact(component, { ...action, optimist: { type: BEGIN, id } })
    return {
      commit: (a = {}) => {
        this.transact(component, { ...action, type: `${action.type}:commit`, ...a, optimist: { type: COMMIT, id } }, query, remote)
      },
      revert: (a = {}) => {
        this.transact(component, { ...action, type: `${action.type}:revert`, ...a, optimist: { type: REVERT, id } })
      }
    }
  }

  run(saga, ...args) {
    return this.env.store.sagas.run(saga, ...args)
  }

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
