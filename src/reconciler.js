import { render, unmountComponentAtNode } from 'react-dom'
import React from 'react'
import { BEGIN, COMMIT, REVERT } from 'redux-optimist'

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
    global.$$$ = this // dev only, why not
  }

  read(query, remote) {
    // remotes etc
    let answer = this.env.parser(this.env, query)
    if(remote && this.env.remotes.length > 0) {

      let remotes = this.env.remotes.reduce((o, r) => (o[r] = this.env.parser(this.env, query, r), o), {})
      this.env.store.dispatch({ type: ACTIONS.remoteSend, payload: { remotes } })
      let d = {}
      d.merge = data => this.transact({ type: 'disto.merge', payload: data })
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
  transact(component, action, query, remote = true) { // query === keys to refresh
    // knowing that ut
    this.env.store.dispatch(action)
    this.refresh()
    if(query) {
      this.read(query, remote) // just for the side effect
    }
  }

  refresh(remote) {

    if(!this.root) {
      console.warn('root missing?')
      return

    }
    let c = this.env.store.getState().components.get(this.root)
    let answer = this.read(bindParams(c.query, c.params), remote)

    if(!this.baseRoot) {
      console.warn('base root missing?')
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


// import {PropTypes, Component, Children} from 'react';
// import {BEGIN, COMMIT, REVERT} from 'redux-optimist';

// export class Optimist extends Component{
//   transactionID = 0;

//   optimist = name => {
//     const id = this.transactionID++;
//     return {
//       begin: action => ({
//         type: name,
//         ...action,
//         optimist: {type: BEGIN, id}
//       }),
//       commit: action => ({
//         type: `${name}:commit`,
//         ...action,
//         optimist: {type: COMMIT, id}
//       }),
//       revert: action => ({
//         type: `${name}:revert`,
//         ...action,
//         optimist: {type: REVERT, id}
//       })
//     };
//   };

//   static childContextTypes = {
//     optimist: PropTypes.func
//   };

//   getChildContext(){
//     return {
//       optimist: this.optimist
//     };
//   }

//   render(){
//     return Children.only(this.props.children);
//   }
// }


