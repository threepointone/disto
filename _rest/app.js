'use strict';
// get some dependencies
import 'babel/polyfill';
import 'whatwg-fetch';  // polyfill for w3c .fetch() api
import React from 'react'; window.React = React;
import imm from 'immutable';
import immumix from 'react-immutable-render-mixin';
import {decorate as mixin} from 'react-mixin';
import request from 'superagent';
import autobind from 'autobind-decorator';


let Component = React.Component;

// disto
import {Dis, act} from '../src/index';
import mix from '../src/mix';
import recorder from '../src/record';

// make a new dispatcher
let {dispatch, register, waitFor} = recorder(new Dis());


// a couple of helpers to fetch data
const services = {
  search(query, callback){
    return request(`http://localhost:3142/list/${query}?rows=20`).end(callback);
  },
  details(id, callback){
    return request(`http://localhost:3142/product/${id}`).end(callback);
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
  init: () => services.config($.init.done), // load config,
  search: query => services.search(query, $.search.done),
  details: id => services.details(id, $.details.done),
  select: id => $.details(id),
  backToList: ''
}, 'dev');
// ... that's it. most of the 'logic' is in the stores.

// stores

const list = register(imm.fromJS({
  loading: false,
  query: '',
  results: [],
  selected: false
}), (o, action, ...args) => {
  switch(action){

    case $.search:
      let [query] = args;

      return o.merge(imm.fromJS({
        selected: false,
        loading: true,
        query: query,
        error: null
      }));

    case $.search.done:
      const [err, res] = args;
        return (err || res.error) ?
          o.merge(imm.fromJS({
            loading: false,
            results: [],
            error: err || res.error
          })) :
          o.merge(imm.fromJS({
            loading: false,
            results: res.body.data.results.products,
            error: null
          }));

    case $.select:
      let [id] = args;
      return o.merge(imm.fromJS({
        selected: id
      }));

    case $.backToList:
       return o.merge(imm.fromJS({
        selected: null
      }));

    default:
      return o;
  }
}, imm.is);

const details = register(imm.fromJS({
  loading: false,
  query: '',
  results: []
}), (o, action, ...args) => {
  switch(action){

    case $.details:
      let [id] = args;

      return o.merge(imm.fromJS({
        loading: true, id,
        details: null,
        error: null
      }));

    case $.details.done:
      const [err, res] = args;
      return (err || res.error) ?
        o.merge(imm.fromJS({
          loading: false,
          details: [],
          error: err || res.error})) :
        o.merge(imm.fromJS({
          loading: false,
          details: res.body.data,
          error: null
        }));

    default:
      return o;
  }
}, imm.is);

const conf = register({}, (config, action, ...args) => {
  switch(action){
    case $.init:

      return config;
    case $.init.done:
      let [err, res] = args;
      return (err || res.error) ? { error: err || res.error } : res;
    default:
      return config;
  }
});

// const dumbo = register({}, (o, action, ...args) => {
//   waitFor(list, details, conf);
//   console.log(action + '', ...args);
//   return o;
// });

@mixin(immumix)
@mixin(mix)
class App extends Component {
  observe(props){
    return {
      list,
      details
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
      selected = props.list.get('selected');

    return (
      <div className="Search">
        <input value={props.list.get('query')} onChange={this.onChange}/>
        <Results {...props} style={vis(!selected)}/>
        <Details key={props.details.get('id')} {...props} style={vis(!!selected)}/>
      </div>
    );
  }
}



@mixin(immumix)
class Results extends Component {
  render() {
    return (
      <div className="Results" style={this.props.style}>
        {this.props.list.get('results').map(item => <Result product={item} key={item.get('styleid')}/>)}
      </div>
    );
  }
}

@mixin(immumix)
class Result extends Component {
  @autobind
  onClick(){
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
    const props = this.props;
    return (
      <div className='Details-cnt' style={props.style}>
        <span style={{cursor: 'pointer'}} onClick={$.backToList}>back to list page</span>
        {props.details.get('loading') ?
          <span>loading...</span> :
          <div className="Details">
            <img src={props.details.getIn('details.styleImages.default.imageURL'.split('.'))} style={{maxWidth: 200}}/>
            <span>{props.details.getIn('details.productDisplayName'.split('.'))}</span>
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


