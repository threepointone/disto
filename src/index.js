import React, { Component, PropTypes } from 'react'

// redux
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'

// redux-saga
import createSagaMiddleware from 'redux-saga'
import { Sagas, Saga, saga } from 'react-redux-saga'

// optimist
import optimist from 'redux-optimist'
import { Optimist } from 'react-redux-optimist'

// redux-react-local
import { local, reducer } from 'redux-react-local'

// fsa
import ensureFSA from './ensure-fsa'

// perf
import { batchedSubscribe } from 'redux-batched-subscribe'
import { unstable_batchedUpdates } from 'react-dom'

function makeStore(reducers = {}, initial = {}, middleware = []) {
  let sagaMiddleware = createSagaMiddleware()
  // create a redux store
  const store = createStore(
    // reducer
    optimist(combineReducers({
      ...reducers,
      local: reducer
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
      batchedSubscribe(unstable_batchedUpdates))
  )

  store.sagas = sagaMiddleware
  return store
}


class Root extends Component {
  // optionally accept middleware/reducers to add on to the redux store
  static propTypes = {
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired
    })
  };
  store = this.props.store ||
    makeStore(this.props.reducers, this.props.initial, this.props.middleware)
  render() {
    return <Provider store={this.store}>
      <Sagas middleware={this.store.sagas}>
        <Optimist>
          {this.props.children}
        </Optimist>
      </Sagas>
    </Provider>
  }
}


module.exports = {
  Root,
  makeStore,
  local,
  Saga,
  saga
}