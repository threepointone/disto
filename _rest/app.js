'use strict';
// get some dependencies
import 'whatwg-fetch';  // polyfill for w3c .fetch() api
import React from 'react'; window.React = React;
import imm from 'immutable';
import immumix from 'react-immutable-render-mixin';
import {decorate as mixin} from 'react-mixin';
import request from 'superagent';
import autobind from 'autobind-decorator';


let Component = React.Component;

// disto
import {Dis, act} from '../index';
import mix from '../src/mix';

// make a new dispatcher
let {dispatch, register, waitFor} = new Dis();


// a couple of helpers to fetch data
const services = {
  search(query, callback){
    return request(`http://localhost:3000/list/${query}?rows=20`).end(callback);
  },
  details(id, callback){
    return request(`http://localhost:3000/product/${id}`).end(callback);
  },
  config(callback){
    // fake fetching some async config
    setTimeout(()=> {
      callback(null, {configObj: {x: 1}});
    }, Math.random() * 500);
  }
};


// declare actions
const $ = act(dispatch, {
  init: {end: ''},
  search: {done: ''},
  details: {done: ''},
  select: id => $.details(id),
  backToList: ''
}, 'dev');
// ... that's it. most of the 'logic' is in the stores.

// stores

const listStore = register(imm.fromJS({
  loading: false,
  query: '',
  results: [],
  selected: false
}), (list, action, ...args) => {
  switch(action){

    case $.search:
      let [query] = args;
      services.search(query, $.search.done);
      return list.merge(imm.fromJS({
        selected: false,
        loading: true,
        query: query,
        error: null
      }));

    case $.search.done:
      const [err, res] = args;
        return (err || res.error) ?
          list.merge(imm.fromJS({
            loading: false,
            results: [],
            error: err || res.error
          })) :
          list.merge(imm.fromJS({
            loading: false,
            results: res.body.data.results.products,
            error: null
          }));

    case $.select:
      let [id] = args;
      return list.merge(imm.fromJS({
        selected: id
      }));

    case $.backToList:
       return list.merge(imm.fromJS({
        selected: null
      }));

    default:
      return list;
  }
}, imm.is);

const detailsStore = register(imm.fromJS({
  loading: false,
  query: '',
  results: []
}), (details, action, ...args) => {
  switch(action){

    case $.details:
      let [id] = args;
      services.details(id, $.details.done);
      return details.merge(imm.fromJS({
        loading: true, id,
        details: null,
        error: null
      }));

    case $.details.done:
      const [err, res] = args;
      return (err || res.error) ?
        details.merge(imm.fromJS({
          loading: false,
          details: [],
          error: err || res.error})) :
        details.merge(imm.fromJS({
          loading: false,
          details: res.body.data,
          error: null
        }));

    default:
      return details;
  }
}, imm.is);

const confStore = register({}, (config, action, ...args) => {
  switch(action){
    case $.init:
      services.config($.init.end); // load config
      return config;
    case $.init.done:
      let [err, res] = args;
      return (err || res.error) ? { error: err || res.error } : res;
    default:
      return config;
  }
});

const dumbo = register({}, (state, action, ...args) => {
  waitFor(listStore, detailsStore, confStore);
  console.log(action+'', ...args);
  return {};
});

@mixin(immumix)
@mixin(mix)
class App extends Component {
  observe(props){
    return {
      list: listStore,
      details: detailsStore
    };
  }
  render() {
    return <Search {...this.state.data} />;
  }
}


function vis(bool){
  return bool ? {} : {display: 'none'};
}

@mixin(immumix)
class Search extends Component {
  sender(fn){
    return function(){
      this.send(fn, ...arguments);
    };
  }
  onChange(e){
    $.search(e.target.value);
  }
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
}



@mixin(immumix)
class Results extends Component {
  render() {
    return (
      <div className="Results" style={this.props.style}>
        {this.props.list.get('results').map((item, i) => <Result product={item} key={item.get('styleid')}/>)}
      </div>
    );
  }
}

@mixin(immumix)
class Result extends Component {
  @autobind
  onClick(e){
    $.select(this.props.product.get('styleid'));
  }
  render() {
    const props = this.props;
    return (
      <div className="Result" onClick={this.onClick} style={{width: 200, display: 'inline-block'}}>
        <span>{props.product.get('product')}</span>
        <img key={Date.now()} src={props.product.get('search_image')} style={{maxWidth: 200}}/>
      </div>
    );
  }
}


@mixin(immumix)
class Details extends Component {
  render() {
    const props = this.props, {details} = props;
    return (
      <div className='Details-cnt' style={props.style}>
        <span style={{cursor: 'pointer'}} onClick={$.backToList}>back to list page</span>
        {details.get('loading') ?
          <span>loading...</span> :
          <div className="Details">
            <img src={details.getIn('details.styleImages.default.imageURL'.split('.'))} style={{maxWidth: 200}}/>
            <span>{details.getIn('details.productDisplayName'.split('.'))}</span>
          </div>}
      </div>
    );
  }
}

function main(){
  $.init();
  React.render(<App/>, document.getElementById('container'));
}

main();


