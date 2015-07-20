import React from 'react';
import { createRedux } from 'redux';
import { Provider, Connector } from 'redux/react';

export class Flux extends React.Component{
  state = {
    redux: createRedux(this.props.stores)
  }
  render(){
    return <Provider redux={this.state.redux}>{
      () => <Connector>{
        state => this.props.children(state, state.dispatch)
      }</Connector>
    }</Provider>
  }
}
