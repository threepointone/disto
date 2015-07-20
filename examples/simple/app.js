import React from 'react';
import {Flux} from '../../src';

function sleep(n){
  return new Promise((resolve, reject)=>setTimeout(()=> resolve(), n));
}

let counter = (o = {count: 0}, action) =>
  (action.type === 'inc') ?  {count: o.count + 1} : o;

let actions = {
  inc: '', // dispatches .type === 'inc'
  decAsync: async function(){
    await sleep(1000);
  }   // dispatches .type === 'decAsync'
      // and then .type ==='decAsync.done' after 1 second
};


export class App {
  render() {
    return <Flux stores={{counter}} actions={actions}>{
      ({counter}, $) =>
        <div onClick={() => $.inc()}>
          clicked {counter.count} times
        </div>
    }</Flux>;
  }
}

