import React from 'react';
import {mix, hot} from '../../src';


import {dis} from './dis';

const // r = record.setup(dis, module),
  {register, act} = hot(dis, module);

export const $ = act({
  click: ''
});

export const counter = register({x: 0}, (o, action) => {
  switch(action){
    case $.click:
      return {x: o.x + 2};
    default: return o;
  }
});

export const App = React.createClass({
  mixins: [mix],
  observe(){
    return {counter};
  },
  render() {
    return <div onClick={$.click}>{this.state.data.counter.x}</div>;
  }
});

