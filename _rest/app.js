"use strict";
// get some dependencies
import "babelify/polyfill"; // for some es6 goodness
import 'whatwg-fetch';  // polyfill for w3c .fetch() api
import React from 'react';  window.React = React;
import imm from 'immutable';
import immumix from 'react-immutable-render-mixin';
import {decorate as mixin} from 'react-mixin';
import request from 'superagent';
import autobind from 'autobind-decorator';

function log(...args){
  return console.log(...args)
}

import {go, timeout, chan, putAsync} from 'js-csp';

let Component = React.Component;

// disto
import {sto, Dis, toObs, toOb} from '../index';
import act, {sync} from '../act'; 
import mix from '../mix';

// make a new dispatcher
var dis = new Dis(),
  {dispatch, register, unregister, waitFor} = dis;

function fromEvent(o, e){
  var c = chan();
  o.on(e, (...args) => putAsync(c, args));
   // todo - .off?
  return c;
}

function reqChan(req){
  var c = chan();
  req.end((err, res) => {
    putAsync(c, [err, res]);
    c.close()
  });
  return c;

}
// a couple of helpers to fetch data 
const services = {
  search(query){  
    return reqChan(request(`http://localhost:3000/list/${query}?rows=20`));
  },

  details(id){
    return reqChan(request(`http://localhost:3000/product/${id}`))
  },
  config(){
    
    var c = chan()
    // fake fetching some async config
    setTimeout(()=> {
      putAsync(c, {configObj:{x:1}})
      c.close();
    }, Math.random()*500);
    return c;
  }    
}


// declare actions 
const $ = act(dispatch, {
  init(ch){
    go(function*(){
      yield ch; // wait for init signal
      this.init.end(yield services.config()); // load config
      log('loaded!')
    }.bind(this))
  }, 'init.end':'',

  search(ch){
    go(function*(){
      while(true) {
        var response = yield services.search(yield ch);
        var done = this.search.done; // this is to work around a babel bug
        done(...response); // let's see what happens on error      
      }
    }.bind(this))
  }, 'search.done':'',
  
  details(ch){
    go(function*(){
      while(true) {
        var response = yield services.details(yield ch);
        var done = this.details.done; // this is to work around a babel bug
        done(...response);
      }
    }.bind(this))
  }, 'details.done':'',
  
  select: sync(id => $.details(id)),
  backToList: ''
});

// stores

const listStore = sto(imm.Map({
  loading: false, 
  query: '', 
  results: [], 
  selected: false
}), (list, action, ...args) => {
  switch(action){
    
    case $.search: 
      let [query] = args;
      return list.merge(imm.fromJS({
        selected: false, 
        loading: true, 
        query:query, 
        error: null
      }));

    case $.search.done: 
      const [err, res] = args;
        return (err || res.error) ? 
          list.merge(imm.fromJS({
            loading:false, 
            results: [], 
            error: err || res.error
          })) :
          list.merge(imm.fromJS({
            loading:false, 
            results: res.body.data.results.products, 
            error: null
          }));
     
    case $.select: 
      let [id] = args;
      return list.merge({
        selected: id
      });
     
    case $.backToList:
       return list.merge({
        selected: null
      });
    
    default: 
      return list;
  }
}, imm.is);

const detailsStore = sto(imm.Map({
  loading: false, 
  query: '', 
  results: []
}), (details, action, ...args) => {
  switch(action){

    case $.details:
      let [id] = args;
      return details.merge(imm.fromJS({
        loading: true, id, 
        details:null, 
        error: null
      }));
    
    case $.details.done:
      const [err, res] = args;
      return (err || res.error) ? 
        details.merge(imm.fromJS({
          loading:false, 
          details: [], 
          error: err || res.error})) :
        details.merge(imm.fromJS({
          loading:false, 
          details: res.body.data, 
          error: null
        }));

    default: 
      return details;
  }
}, imm.is);

const confStore= sto({}, (config, action, ...args)=>{
  if(action===$.init.done){
    let [err, res] = args;
    return (err || res.error) ? { error: err || res.error  } : res
  }
  return config;
})

const dumbo = sto({},(_, action, ...args) => {
  dis.waitFor(listStore, detailsStore, confStore);
  console.log(action+'', ...args
  //   , {
  //   list: listStore().toJS(),
  //   details: detailsStore().toJS()
  // }
  )
  return {};
})

@mixin(immumix)
@mixin(mix)
class App extends Component {
  observe(props){
    return {
      list: toOb(listStore), 
      details: toOb(detailsStore)
    };
  }
  render() {
    return <Search {...this.state.data} />
  }
};


function vis(bool){
  return bool ? {} : {display: 'none'};
}    

@mixin(immumix)
class Search extends Component {
  sender(fn){
    return function(){
      this.send(fn, ...arguments);      
    }    
  }
  // @channel()
  onChange(e){
    // go(function*(){
      // while(true){
    $.search(e.target.value)  
      // }
    // })
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
};



@mixin(immumix)
class Results extends Component {
  render() {
    return (
      <div className="Results" style={this.props.style}>
        {this.props.list.get('results').map((item, i) => <Result product={item} key={item.get('styleid')}/>)}
      </div>
    );
  }
};

@mixin(immumix)
class Result extends Component {
  @autobind
  onClick(e){
    $.select(this.props.product.get('styleid'))
  }
  render() {
    return (
      <div className="Result" onClick={this.onClick} style={{width:200, display:'inline-block'}}>
        <span>{this.props.product.get('product')}</span>
        <img key={Date.now()} src={this.props.product.get('search_image')} style={{maxWidth:200}}/>      
      </div>
    );
  }
}


@mixin(immumix)
class Details extends Component {
  render() {
    var props = this.props, {details} = props;
    return (
      <div className='Details-cnt' style={props.style}>
        <span style={{cursor:'pointer'}} onClick={$.backToList}>back to list page</span> 
        {details.get('loading') ? 
          <span>loading...</span> : 
          <div className="Details">
            <img src={details.getIn(['details', 'styleImages', 'default', 'imageURL'])} style={{maxWidth:200}}/>
            <span>{details.getIn(['details', 'productDisplayName'])}</span>
          </div>}
      </div>   
    );
  }
};

function main(){
  // register stores
  [listStore, detailsStore, confStore, dumbo].map(register);
    
  // because the views are decoupled, you can bootstrap data etc way before render
  go(function*(){
    var actions = fromEvent(dis, 'action');
    while((yield actions)[0]!== $.init.end){} // strange code, I know
    React.render(<App/>, document.getElementById('container'))    
  })
  
  $.init();  
}

main();


