import React from 'react';
import { Provider, Connector } from 'redux/react';

import { createRedux, createDispatcher, composeStores, bindActionCreators } from 'redux';
import thunkMiddleware from 'redux/lib/middleware/thunk';

export class Flux extends React.Component{
  state = {
    redux: this.props.redux || createRedux(createDispatcher(
      composeStores(this.props.stores),
      getState => [thunkMiddleware(getState)]
    ))
  }
  render(){
    return <Provider redux={this.state.redux}>{
      () => <Connector>{
        state => this.props.children(state, bindActionCreators(this.props.actions || {}, state.dispatch))
      }</Connector>
    }</Provider>
  }
}

