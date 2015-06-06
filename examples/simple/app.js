import React from 'react';
import {Dis, hot, record, mix} from '../../src';

export const dis = new Dis();

const r = record.setup(dis, module),
  {register, act} = dis;

export const $ = act({
  click: ''
});

export const counter = register(0, (o, action) => {
  switch(action){
    case $.click:
      return o + 1;
    default: return o;
  }
});

export const App = React.createClass({
  mixins: [mix],
  observe(){
    return {counter};
  },
  render() {
    return <div onClick={$.click}>{this.state.data.counter}</div>;
  }
});


window.r = r;

