import { render, unmountComponentAtNode } from 'react-dom'
import React from 'react'
// import { BEGIN, COMMIT, REVERT } from 'redux-optimist'

import { Root, makeStore } from './root'
import { bindVariables } from './ql'
import { getQuery, makeParser } from './db'

import { log } from './util'

export const ACTIONS = {
  setVariables: 'disto.setVariables',
  setQuery: 'disto.setQuery',
  merge: 'disto.merge',
  remoteSend: 'disto.remoteSend',
  setState: 'disto.setState'

}

function find(fn) {
  for(let i = 0; i< this.length; i++) {
    if(fn(this[i])) {
      return this[i]
    }
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
      // this.env.store.dispatch({ type: ACTIONS.remoteSend, payload: remotes })

    }
    return answer
  }

  sendFn = (fn) => {
    this.merge(fn) //to fix
  }

    // *!*
  transactionID = 0
  transact(component, action, query, remote = true) { // query === keys to refresh
    // knowing that ut

    // let txn = this.env.parser(this.env, action)    // { value : { keys, tempids }} ???

    // // debug: dispatch *after* doing the mutation
    // this.env.store.dispatch({ ...action, txn })

    if(remote && this.env.remotes.length > 0) {
      // if remote, mark all mutations that happen as optimistic
      // let id = this.transactionID++
      // need to mark whatever mutation happens next as optimistic
      this.env.parser(this.env, action)    // { value : { keys, tempids }} ???

      // debug: dispatch *after* doing the mutation
      // this.env.store.dispatch({ ...action, txn })

      let remotes = this.env.remotes.reduce((o, r) =>

        (o[r] = this.env.parser(this.env, action, r), o), {})

      // first time it's called, revert all optimistic updates
      // let reverted = false
      this.env.send(remotes, (fn) => {
        // if(!reverted) {
        //   this.env.store.dispatch({ type: 'disto.optimistic.revert' , payload: { id } })
        //   reverted = true
        // }

        this.sendFn(fn)
      })

    }
    else {
      let txn = this.env.parser(this.env, action)    // { value : { keys, tempids }} ???
      // debug: dispatch *after* doing the mutation
      // this.env.store.dispatch({ ...action, txn })

    }

    this.refresh()
    if(query) {
      this.read(query, remote) // just for the side effect
    }
  }


  // *!*
  add(Component, element) {
    this.element = element
    this.Component = Component
    let answer = this.read(getQuery(Component), true)
    render(this.createElement(Component, answer), element)
    // this.env.store.dispatch({ type: 'disto.register', payload: this.baseRoot.registered })
    // update view query in state
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
    // delete this.root
    delete this.baseRoot

  }

  // *!*
  refresh(remote) {
    // this has to become a 'scheduler'
    // if(!this.root) {
    //   // console.warn('root missing?')   // eslint-disable-line no-console
    //   return

    // }
    // we should store this query locally?
    // rather, under 'root'
    let c = this.env.store.getState().components::find(p => p[0][0][0] === 'root:view')[1]
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
    this.env.store.dispatch({ type: ACTIONS.setVariables, payload: { path: component['disto:path'], variables } })
    this.refresh(remote)
  }
  // *!*
  setQuery(component, query, variables, remote = true) {
    this.env.store.dispatch({ type: ACTIONS.setQuery, payload: { path: component['disto:path'], query, variables } })
    this.refresh(remote)
  }

  // *!*
  // setState(component, state) {
  //   this.env.store.dispatch({ type: ACTIONS.setState, payload: { component, state } })
  // }

  // *!*
  merge(novelty) {
    // todo - normalize etc
    this.env.store.dispatch({ type: ACTIONS.merge, novelty })
    this.refresh()
  }


  // run(saga, ...args) {
  //   return this.env.store.sagas.run(saga, ...args)
  // }

  // setRoot(instance) {
  //   this.root = instance
  // }

  // fromHistory(r, uuid) {
  //   this.store.dispatch({ type: ACTIONS.fromHistory, payload: uuid })
  // }

}


export function application(config) {
  return new Reconciler(config)
}
