import React from 'react';
import {Flux} from '../../src';

let counter = (o = {count: 0}, action) =>
  (action.type === 'inc') ?  {count: o.count + 1} : o;

export class App {
  render() {
    return <Flux stores={{counter}} actions={{inc: () => ({type:'inc'})}}>{
      ({counter}, $) =>
        <div onClick={$.inc}>
          clicked {counter.count} times
        </div>
    }</Flux>;
  }
}

