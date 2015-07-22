import React from 'react';
import {Flux, Connect} from '../../src';


let stores = {
  counter(o = {count: 0}, action) {
    return (action.type === 'inc') ? {count: o.count + 1} : o;
  },
  c2(o = {count: 0}, action) {
    return (action.type === 'dec') ? {count: o.count - 1} : o;
  }
};

let actions = {
  inc: () => ({type: 'inc'}),
  dec: () => ({type: 'dec'})
};

export class App {
  render() {
    return <Flux stores={stores} actions={actions}>{
      ({counter}, $) =>
        <div onClick={$.inc}>
          clicked {counter.count} times

        {/* no need to pass anything! */}
        <SubComponent/>

        </div>
    }</Flux>;
  }
}



class SubComponent{
  render(){
    return <Connect select={state=> state.c2} actions={actions}>{
      c2 => <div>while here it says {c2.count}</div>
    }</Connect>;
  }
}



