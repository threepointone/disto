"use strict";
require("babelify/polyfill");

const React = require('react'), 
	imm = require('immutable'), 
	ImmutableRenderMixin = require('react-immutable-render-mixin');

window.React = React;

const disto = require('../index');
const {sto, Dis, act, mix, toObs, toOb} = disto;

// make a new dispatcher
const dis = new Dis(),
  {fn, dispatch, register, waitFor} = dis;

// declare some actions
const $ = act(`{tick toggle}`);

// action creators
const $$ = {
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
const tickStore = sto({
  soFar:0, 
  ticks: 0,
  start:Date.now()
}, function(o, action){
  if(action===$.tick){
    waitFor(toggleStore);
    if(toggleStore().now){
      return Object.assign({}, o, {soFar: o.soFar + (Date.now() - o.start), ticks: o.ticks+1})
    }
  }
  return o;
});
register(tickStore);
  
const toggleStore = sto({now:false, times:0}, function(o, action){
  if(action === $.toggle){
    return Object.assign({}, o,  {now: !o.now, times: o.times+1 });  
  }
  return o;
});
register(toggleStore);


// views
var App = React.createClass({
  mixins: [mix],
  observe(){ 
    return toObs({tick: tickStore, toggle: toggleStore}); 
  },
  render() {
    const data = this.state.data;
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