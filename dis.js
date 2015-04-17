"use strict";

var EventEmitter = require('events').EventEmitter;
var log = require('debug')('eterna:dispatcher');
var invariant = require('invariant');

import autobind from 'autobind-decorator';


class Dispatcher extends EventEmitter{
  constructor(){
    super();
    this.stores = [];

  }

  @autobind
  register(store){
    // invariant(store instanceof require('./store'), 'store must be a valid instance');
    this.stores.push(store);
    // because the dispatcher is a central point for the stores, 
    // it makes sense to have a change listener here
    var fn = (e, ...args) => this.emit('change', store, ...args)
    store.on('change', fn);
    var t = this;
    return {
      off() {
          t.stores = t.stores.filter(x=> x!=store);    
          store.off('change', fn)
      }
    }
  }

  @autobind
  waitfor(...stores){
    invariant(this.running, 'cannot waitfor when no message is being sent');
    invariant(stores.length>0, 'cannot wait for no stores');
    stores.forEach(store => this._process(store, this._currentAction, ...this._currentArgs))
    
  }

  _process(store, action, ...args){
    invariant(this.running, 'cannot process when not running');
    if(!this._processed.get(store)){      
      store(action, ...args);
      this._processed.set(store, true);  
    }
  }

  @autobind
  dispatch(action, ...args){
    invariant(!this.running, 'cannot dispatch while another\'s going on');
    invariant(action, 'cannot dispatch a blank action');
    this.running = true;
    this._currentAction = action;
    this._currentArgs = args;

    this._processed= new WeakMap();
    this.stores.map(store => this._process(store, action, ...args));
    
    delete this._processed;
    delete this._currentAction;
    delete this._currentArgs;

    this.running = false;
    this.emit('action', action, ...args);
  }

  @autobind
  fn(action){
    return function(...args){
      return this.dispatch(action, ...args);
    }
  }

}

module.exports = Dispatcher;