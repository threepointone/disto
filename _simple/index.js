// NOT WORKING, need to fix actions

// get some dependencies
import 'babelify/polyfill'; // for some es6 goodness
import React from 'react'; window.React = React;
import {decorate as mixin} from 'react-mixin';

import {go, timeout, alts} from 'js-csp';

// pull out the magic 4
import {
  sto,    // creates stores
  Dis,    // dispatcher class
  toObs,  // create observables from a keyed collection of stores
  toOb,   // create observable from a store
  act     // action constant creator
} from '../index';

import mix from '../mix'; // mixin for .observe()

// make a new dispatcher
var dis = new Dis(),
  {dispatch, register, waitFor} = dis;

// actions
var $ = act(dispatch, {
  tick: '',
  toggle: function(ch){
    go(function*(){
      while(true){
        $.tick();
        if((yield alts([timeout(0), ch])).channel === ch){
          yield ch; // block unti it toggles again
        }
      }
    }.bind(this));
  }
});

// stores
var tickStore = sto({
  soFar: 0,
  ticks: 0,
  start: Date.now()
}, (o, action) => {
  if(action === $.tick)
    return {
      soFar: o.soFar + (Date.now() - o.start),
      ticks: o.ticks+1,
      start: o.start
    };
  return o;
});
register(tickStore);

var toggleStore = sto({
  times: 0
}, (o, action) => {
  if(action === $.toggle)
    return {times: o.times+1};
  return o;
});
register(toggleStore);

// views
@mixin(mix)
class App extends React.Component {
  observe(){
    return toObs({ tick: tickStore, toggle: toggleStore });
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

