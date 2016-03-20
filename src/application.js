import { render, unmountComponentAtNode } from 'react-dom'
import React from 'react'
import { BEGIN, COMMIT, REVERT } from 'redux-optimist'

import { Root, makeStore } from './root'
import { bindVariables } from './ql'
import { getQuery, makeParser } from './db'

import { log } from './util'

export const ACTIONS = {
  register: 'disto.register',
  unregister: 'disto.unregister',
  fromHistory: 'disto.fromHistory',
  setVariables: 'disto.setVariables',
  setQuery: 'disto.setQuery',

  merge: 'disto.merge',
  remoteSend: 'disto.remoteSend',
  setState: 'disto.setState'

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
      store: store && typeof store.dispatch === 'function' ? store : makeStore({ _: store }, reduce, middleware),
      send
    }
    global.$$$ = this // dev only, why not
  }

  get() {
    return this.env.store.getState()._
  }
  // sendFns = {
  //   merge: data => this.merge(data),
  //   optimistic: (...args) => this.optimistic(...args),
  //   transact: (...args) => this.transact(...args)
  // }

  // *!*
  read(query, remote) {
    // remotes etc
    let answer = this.env.parser(this.env, query)
    if(remote && this.env.remotes.length > 0) {

      let remotes = this.env.remotes.reduce((o, r) =>
        (o[r] = this.env.parser(this.env, query, r), o), {})

      this.env.send(remotes, this.sendFn)

      // debug
      this.env.store.dispatch({ type: ACTIONS.remoteSend, payload: remotes })

    }
    return answer
  }

  sendFn = (err, data) => {
    this.merge(err || data) //to fix
  }

    // *!*
  transact(action, query, remote = true) { // query === keys to refresh
    // knowing that ut

    // if remote, mark all mutations that happen as optimistic
    let txn = this.env.parser(this.env, action)    // { value : { keys, tempids }} ???

    // debug: dispatch *after* doing the mutation
    this.env.store.dispatch({ ...action, txn })

    if(remote && this.env.remotes.length > 0) {

      let remotes = this.env.remotes.reduce((o, r) =>
        (o[r] = this.env.parser(this.env, action, r), o), {})

      // first time it's called, revert all optimistic updates
      this.env.send(remotes, this.sendFn)

    }

    this.refresh()
    if(query) {
      this.read(query, remote) // just for the side effect
    }
  }


  // *!*
  register(instance, klass, p = instance.props) {

    let vars = klass.variables ? klass.variables() : undefined,
      id = klass.ident ? klass.ident(p) : undefined,
      q = klass.query ? klass.query(instance, p) : undefined,
      data = {
        ident: id,
        query: q,
        variables: vars
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
  refresh(remote) {

    if(!this.root) {
      // console.warn('root missing?')   // eslint-disable-line no-console
      return

    }
    let c = this.env.store.getState().components.get(this.root)
    let answer = this.read(bindVariables(c.query, c.variables), remote)

    if(!this.baseRoot) {
      console.warn('base root missing?')  // eslint-disable-line no-console
    }
    else {
      this.baseRoot.setAnswer(answer)
    }

  }

  // *!*
  setVariables(component, variables, remote = true) {
    this.env.store.dispatch({ type: ACTIONS.setVariables, payload: { component, variables } })
    this.refresh(remote)
  }
  // *!*
  setQuery(component, query, variables, remote = true) {
    this.env.store.dispatch({ type: ACTIONS.setQuery, payload: { component, query, variables } })
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
  optimistic(action, query, remote) {
    // we don't really use component, just for consistency
    const id = this.transactionID++
    this.transact({ ...action, optimist: { type: BEGIN, id } })
    return {
      commit: (a = {}) => {
        this.transact({ ...action, type: `${action.type}:commit`, ...a, optimist: { type: COMMIT, id } }, query, remote)
      },
      revert: (a = {}) => {
        this.transact({ ...action, type: `${action.type}:revert`, ...a, optimist: { type: REVERT, id } })
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


export function application(config) {
  return new Reconciler(config)
}
