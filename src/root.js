import React, { Component, PropTypes } from 'react'

// redux
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
// import { Provider } from 'react-redux'
import { log } from './util'

// redux-saga
// import createSagaMiddleware from 'redux-saga'
// import { take } from 'redux-saga/effects'
// import { Sagas } from 'react-redux-saga'

// optimist
// import optimist from 'redux-optimist'
// import { Optimist } from 'react-redux-optimist'

// redux-react-local
// import Local from 'redux-react-local'


// fsa
import ensureFSA from './ensure-fsa'

// import * as R from './reconciler'
import reducer, { components } from './reducer'


// perf
import raf from 'raf'
import { batchedSubscribe } from 'redux-batched-subscribe'
import { unstable_batchedUpdates } from 'react-dom'

// via https://gist.github.com/peteruithoven/9a9363e064ee8bdf28ae
let rafID
let notifyFunc
function animFrame() {
  if (notifyFunc) {
    unstable_batchedUpdates(notifyFunc)
    notifyFunc = null
  }
  rafID = raf(animFrame)
}

function rafUpdateBatcher(notify) {
  if (rafID === undefined) rafID = raf(animFrame)
  notifyFunc = notify
}


export function makeStore(initial = {}, reduce = (x = {}) => x, middleware = []) {
  if(typeof initial === 'function') {
    middleware = reduce
    reduce = initial
    initial = {}
  }
  // let sagaMiddleware = createSagaMiddleware()
  // create a redux store
  const store = createStore(
    // reducer
    // optimist(
      combineReducers({
        _: reducer(reduce),
        // local: Local.reducer,
        components
      }),

    // initial state
    initial || {},

    // middleware
    compose(
      applyMiddleware(...(function *() {
        yield* middleware
        // yield sagaMiddleware
        if (process.env.NODE_ENV === 'development') {
          yield ensureFSA
        }
      }())),
      typeof window === 'object' &&
      typeof window.devToolsExtension !== 'undefined' &&
      global.DISTO === 'development'
        ? window.devToolsExtension() : f => f,
      batchedSubscribe(process.env.RAF === true ?
        rafUpdateBatcher : unstable_batchedUpdates))
  )

  // store.sagas = sagaMiddleware

  // helpers
  // - updateIn
  // - merge

  store.swap = fn => {
    store.dispatch({ type: 'disto.swap', payload: fn })
  }

  return store
}

export class Root extends Component {
  // optionally accept middleware/reducers to add on to the redux store
  static propTypes = {
    // store: PropTypes.shape({
    //   subscribe: PropTypes.func.isRequired,
    //   dispatch: PropTypes.func.isRequired,
    //   getState: PropTypes.func.isRequired
    // })
  }
  state = {
    answer: this.props.answer,
    store: this.props.store
  }
  static childContextTypes = {
    disto: PropTypes.object,
    'disto:path': PropTypes.array,
    'disto:register':  PropTypes.func,
    'disto:unregister': PropTypes.func
  }
  getChildContext() {
    return {
      disto: this.props.reconciler,
      'disto:path': [ ],
      'disto:register':  this.register,
      'disto:unregister': this.unregister
    }
  }
  registered = []
  register = (path, instance, klass) => {
    let vars = klass.variables ? klass.variables() : undefined,
      id = klass.ident ? klass.ident(instance.props) : undefined,
      q = klass.query ? klass.query(instance, instance.props) : undefined,
      data = {
        ident: id,
        query: q,
        variables: vars,
        klass
      }

    // function pathToString(path) {
    //   return path.map(p => p[0]).join('˚')
    // }
    // path)::log()
    // pathToString(path)::log()
    // this.registered.push([ path, data ])
    // console.log('registered', this.registered.length)
    // warn for duplicate defers

    // console.log('register', path, data)

    this.state.store.dispatch({ type: 'disto.register', payload: [ path, data ] })
    // update indices
  }
  unregister = (path, instance, klass) => {
    // todo
    // this.registered = this.registered.filter(([ pp, data ]) => pp.map(p => p[0]).join('π') !== path.map(p => p[0]).join('π'))
    // console.log('unregister', { path, klass })
    // this.env.store.dispatch({ type: 'disto.unregister', payload: { path, data: { klass } } })
  }

  setAnswer(answer) {
    this.setState({ answer })
  }
  componentDidMount() {
    // this.saga = this.store.sagas.run(saga, this.props.reconciler)
  }


  render() {
    let C = this.props.Component
    return <C {...this.state.answer}
              refer={'root:view'}
            />
  }
  componentWillUnmount() {
    // if(this.saga) {
    //   this.saga.cancel()
    //   delete this.saga
    // }
  }
}



// <Sagas middleware={this.state.store.sagas}>
// </Sagas>
// <Provider store={this.state.store}>
// </Provider>
