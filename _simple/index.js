// NOT WORKING, need to fix actions

// get some dependencies
import 'babel/polyfill';
import React from 'react'; window.React = React;
import {decorate as mixin} from 'react-mixin';

import {go, timeout, alts, putAsync, chan} from '../js-csp/csp';

// disto
import {Dis, act} from '../index';
import mix from '../src/mix';

// make a new dispatcher
let {dispatch, register} = new Dis();



// actions
var $ = act(dispatch, {
  tick: '',
  toggle: (function(){
    var c = chan();
    go(function*(){
      while(true){
        $ && $.tick();
        if((yield alts([timeout(0), c])).channel === c){
          yield c; // block unti it toggles again
        }

      }
    });

    return function(){
      putAsync(c, true);
    };
  }())
});



// stores
var tickStore = register({
  soFar: 0,
  ticks: 0,
  start: Date.now()
}, (o, action) => {
  if(action === $.tick){
    return {
      soFar: o.soFar + (Date.now() - o.start),
      ticks: o.ticks + 1,
      start: o.start
    };
  }
  return o;
});

var toggleStore = register({
  times: 0
}, (o, action) => {
  if(action === $.toggle){
    return {times: o.times + 1};
  }
  return o;
});

// views
@mixin(mix)
class App extends React.Component {
  observe(){
    return { tick: tickStore, toggle: toggleStore };
  }
  render(){
    var data = this.state.data;
    return (
      <div className="App">
        <div>time: {data.tick.soFar} </div>
        <button onClick={$.toggle}/>
        <div>clicks: {data.toggle.times} </div>
      </div>
    );
  }
}

React.render(<App/>, document.getElementById('container'));

