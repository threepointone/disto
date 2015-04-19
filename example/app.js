"use strict";
// get some dependencies
import "babelify/polyfill"; // for some es6 goodness
import 'whatwg-fetch';  // polyfill for w3c .fetch() api
import React from 'react';
import imm from 'immutable';
import ImmutableRenderMixin from 'react-immutable-render-mixin';


// pull out the magic 4
import {
  sto,    // creates stores
  Dis,    // dispatcher class
  toObs,  // create observables from a keyed collection of stores
  toOb    // create observable from a store
} from '../index';

import act from '../act'; // action constant creator
import mix from '../mix'; // mixin for .observe()

window.React = React;

// make a new dispatcher
var dis = new Dis(),
  {dispatch, register, unregister, waitFor} = dis;


// a couple of helpers to fetch data 
const services = {
  search(query, callback){   
    return fetch(`http://localhost:3000/list/${query}?rows=20`)
    	.then(res => res.json()).then(res => callback(null, res)).catch(callback)
  },
  details(id, callback){
    return fetch(`http://localhost:3000/product/${id}`)
    	.then(res => res.json()).then(res => callback(null, res)).catch(callback)
  }    
}


// declare actions 
const $ = act(`{ search { done } details { done } select backToList }`);

// stores

const listStore = sto(imm.Map({loading: false, query: '', results: [], selected: false}), 
  (state, action, ...args) => {
    switch(action){
      case $.search: 
        let [query] = args;
        return state.merge(imm.fromJS({selected: false, loading: true, query:query, error: null}));

      case $.search.done: 
        const [err, res] = args;
          return (err || res.error) ? 
            state.merge(imm.fromJS({loading:false, results: [], error: err || res.error})) :
            state.merge(imm.fromJS({loading:false, results: res.data.results.products, error: null}));
       
      case $.select: 
        let [id] = args;
        return state.merge({selected: id});
       
      case $.backToList:
         return state.merge({selected: null});
      
      default: 
        return state;
    }
  }, imm.is);

const detailsStore = sto(imm.Map({loading: false, query: '', results: [], selected: false}), 
  (state, action, ...args) => {
    switch(action){
      case $.details:
        let [id] = args;
        return state.merge({loading: true, id, details:null, error: null});
      
      case $.details.done:
        const [err, res] = args;
        return (err || res.error) ? 
            state.merge({loading:false, details: [], error: err || res.error}) :
            state.merge(imm.fromJS({loading:false, details: res.data, error: null}));

      default: 
        return state;
    }
  }, imm.is);

const dumbo = sto({},() => {
  dis.waitFor(listStore, detailsStore);
  console.log({
    list: listStore().toJS(),
    details: detailsStore().toJS()
  })
  return {};
})


const App = React.createClass({
  mixins:[ImmutableRenderMixin, mix],
  observe(props){
    return {
      list: toOb(listStore), 
      details: toOb(detailsStore)
    };
  },
  render() {
    return <Search {...this.state.data} />
  }
});


function vis(bool){
  return bool ? {} : {display: 'none'};
}    

const Search = React.createClass({
  mixins: [ImmutableRenderMixin],
  onChange(e){
    var query = e.target.value;
    dispatch($.search, query);
    services.search(query, (...args) => dispatch($.search.done, ...args))
  },
  render() {
    var props = this.props,
      {list, details} = props,
      selected = list.get('selected');    
    return (
      <div className="Search">
        <input value={list.get('query')} onChange={this.onChange}/>
        <Results {...props} style={vis(!selected)}/>
        <Details key={details.get('id')} {...props} style={vis(!!selected)}/>        
      </div>
    );
  }
});

const Results = React.createClass({
  mixins: [ImmutableRenderMixin],
  render: function() {
    return (
      <div className="Results" style={this.props.style}>
        {this.props.list.get('results').map((item, i) => <Result product={item} key={item.get('styleid')}/>)}
      </div>
    );
  }
});

const Result = React.createClass({
  mixins: [ImmutableRenderMixin],
  onClick: function(e){
    dispatch($.select, id);
    dispatch($.details, id);
    services.details(id, (...args) => dispatch($.details.done, ...args))
  },
  render: function() {
    return (
      <div className="Result" onClick={this.onClick} style={{width:200, display:'inline-block'}}>
        <span>{this.props.product.get('product')}</span>
        <img key={Date.now()} src={this.props.product.get('search_image')} style={{maxWidth:200}}/>      
      </div>
    );
  }
});



const Details = React.createClass({
  mixins: [ImmutableRenderMixin],
  onBack: function(){
    dispatch($.backToList) 
  },
  render: function() {
    var props = this.props, {details} = props;
    return (
      <div className='Details-cnt' style={props.style}>

        <span style={{cursor:'pointer'}} onClick={this.onBack}>back to list page</span> 
        {details.get('loading') ? 
          <span>loading...</span> : 
          <div className="Details">
            <img src={details.getIn(['details', 'styleImages', 'default', 'imageURL'])} style={{maxWidth:200}}/>
            <span>{details.getIn(['details', 'productDisplayName'])}</span>
          </div>}
      </div>   
    );
  }
});


register(listStore);
register(detailsStore);
register(dumbo);

React.render(<App/>, document.getElementById('container'));
