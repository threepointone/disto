import React, { Component, PropTypes, Children } from 'react'

// redux
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'

// redux-saga
import createSagaMiddleware from 'redux-saga'
// import { take } from 'redux-saga/effects'
import { Sagas } from 'react-redux-saga'

// optimist
import optimist from 'redux-optimist'
import { Optimist } from 'react-redux-optimist'

// redux-react-local
import Local from 'redux-react-local'


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
  let sagaMiddleware = createSagaMiddleware()
  // create a redux store
  const store = createStore(
    // reducer
    optimist(combineReducers({
      _: reducer(reduce),
      local: Local.reducer,
      components
    })),

    // initial state
    initial || {},

    // middleware
    compose(
      applyMiddleware(...(function *() {
        yield* middleware
        yield sagaMiddleware
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

  store.sagas = sagaMiddleware
  return store
}


export class Root extends Component {
  // optionally accept middleware/reducers to add on to the redux store
  static propTypes = {
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired
    })
  }
  state = {
    answer: this.props.answer
  }
  static childContextTypes = {
    disto: PropTypes.object
  }
  getChildContext() {
    return {
      disto: this.props.reconciler
    }
  }

  setAnswer(answer) {
    this.setState({ answer })
  }
  componentDidMount() {
    // this.saga = this.store.sagas.run(saga, this.props.reconciler)
  }

  store = this.props.store
  render() {
    let C = this.props.Component
    return <Provider store={this.store}>
      <Local.Root>
        <Sagas middleware={this.store.sagas}>
          <Optimist>
            <C {...this.state.answer} onRef={r => {this.props.reconciler.setRoot(r)}}/>
          </Optimist>
        </Sagas>
      </Local.Root>
    </Provider>
  }
  componentWillUnmount() {
    // if(this.saga) {
    //   this.saga.cancel()
    //   delete this.saga
    // }
  }
}
