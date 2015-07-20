import React from 'react';
import { Provider, Connector } from 'react-redux';

import { createStore, applyMiddleware, combineReducers, bindActionCreators, compose } from 'redux';
import thunk from 'redux-thunk';
import { devTools, persistState } from 'redux-devtools';

export class Flux extends React.Component{
  state = {
    store: this.props.store || compose(
      applyMiddleware(thunk),
      devTools(),
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)),
      createStore
    )(combineReducers(this.props.stores))
  }

  render(){
    return <Provider store={this.state.store}>{
      () => <Connector>{
        state => this.props.children(
          state,
          bindActionCreators(this.props.actions || {}, state.dispatch),
          this.state.store)
      }</Connector>
    }</Provider>;
  }
}





