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
        state => this.props.children(state, actions(this.props.actions, state.dispatch))
      }</Connector>
    }</Provider>
  }
}


function actions(map, dispatch){
  let o = {};

  function str(...k){
    return [prefix || '', '~', ...k].filter(x => !!x).join(':');
  }

  Object.keys(map).forEach(key => {
    let fn = map[key] || (() => {});
    o[key] = action => {
      dispatch({...action, type: key});
      const p = fn(action);
      if(p instanceof Promise){
        p.then(res => o[key].done(res)).catch(err => o[key].error(err));
      }
      return p;
    };

    o[key].toString = () => str(key);

    o[key].done = action => dispatch({...action, type: `${key}.done`});
    o[key].done.toString = () => str(key, 'done');

    o[key].error = action => dispatch({...action, type: `${key}.error`});
    o[key].error.toString = () => str(key, 'error');

  });
  return o;
}
