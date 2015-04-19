'use strict';

// get some dependencies
import 'babelify/polyfill'; // for some es6 goodness
import 'whatwg-fetch'; // polyfill for w3c .fetch() api
import React from 'react';  

// pull out the magic 4
import {
  sto,    // creates stores
  Dis,    // dispatcher class
  toObs,  // create observables from a keyed collection of stores
  toOb    // create observable from a store
} from '../index';

import act from '../act'; // action constant creator
import mix from '../mix'; // mixin for .observe()

// make a new dispatcher
var dis = new Dis(),
  {dispatch, register, waitFor} = dis;

// declare some actions
var $ = act(`{tick toggle}`);

// action creators
var $$ = {
  toggle: (function(){
    var intval;
    return function(){
      dispatch($.toggle);
      if(!toggleStore().now){ clearInterval(intval); intval = null; }
      else{ intval = setInterval(()=> dispatch($.tick), 0)}
    }
  })()
};

// stores
var tickStore = sto({
  soFar:0, 
  ticks: 0,
  start:Date.now()
}, function(o, action){
  if(action===$.tick){
    waitFor(toggleStore);
    if(toggleStore().now){
      return Object.assign({}, o, {
        soFar: o.soFar + (Date.now() - o.start), 
        ticks: o.ticks+1
      });
    }
  }
  return o;
});
register(tickStore);
  
var toggleStore = sto({
  now:false, 
  times:0
}, function(o, action){
  if(action === $.toggle){
    return Object.assign({}, o, {
      now: !o.now, 
      times: o.times+1 
    });  
  }
  return o;
});
register(toggleStore);


// views
var App = React.createClass({
  mixins: [mix],
  observe(){ 
    // attach our observables here
    return toObs({
      tick: tickStore, 
      toggle: toggleStore
    }); 
  },
  render() {
    var data = this.state.data;
    return (
      <div className="App">
        time: {data.tick.soFar},
        clicks: {data.toggle.times}
        <button onClick={$$.toggle}/>
      </div>
    );
  }
});

React.render(<App/>, document.getElementById('container'));