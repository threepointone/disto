"use strict";

import {Dispatcher} from 'flux';

export default class Dis{
  constructor() {
    this.tokens = new WeakMap();
    this.$ = new Dispatcher();
    ['register', 'unregister', 'dispatch', 'waitfor']
      .forEach(fn => this[fn] = this[fn].bind(this));
  }

  register(store) {
    // implicit test - if store is undefined, the next line throws
    this.tokens.set(store, this.$.register(function(payload){
      store(payload.action, ...payload.args);
    }));
  }

  unregister(store) {
    this.$.unregister(this.tokens.get(store));
    this.tokens.delete(store);
  }

  dispatch(action, ...args) {
    return this.$.dispatch({action, args});    
  }

  waitfor(...stores) {
    return this.$.waitFor([...stores.map(store => this.tokens.get(store))]);
  }
}

