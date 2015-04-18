"use strict";

import invariant from 'flux/lib/invariant';
import { Dispatcher } from 'flux';

import { EventEmitter } from 'events';
import emitMixin from 'emitter-mixin';

export function sto(initial, fn = x => x, areEqual = (a, b) => a === b) {
  var state = initial;
  var F = function(action, ...args) {
    if (action) {
      var oldState = state;
      state = fn(state, action, ...args);
      if (state === undefined) {
        console.warn('have you forgotten to return state?')
      }      
      F.emit('action', action, ...args);      
      if(!areEqual(state, oldState)){
        F.emit('change', state, oldState);
      }
    }
    return state;
  };
  return emitMixin(F);
}

export class Dis extends EventEmitter{
  constructor() {
    super();
    this.tokens = new WeakMap();
    this.$ = new Dispatcher();
    ['register', 'unregister', 'dispatch', 'waitFor']
      .forEach(fn => this[fn] = this[fn].bind(this));
  }

  register(store) {
    invariant(store, 'cannot register a blank store')
    this.tokens.set(store, this.$.register(function(payload){
      store(payload.action, ...payload.args);
    }));
  }

  unregister(store) {
    this.$.unregister(this.tokens.get(store));
    this.tokens.delete(store);
  }

  dispatch(action, ...args) {
    invariant(action, 'cannot dispatch a blank action');
    this.$.dispatch({action, args});    
  }

  waitFor(...stores) {
    invariant(stores.length>0, 'cannot wait for no stores');
    this.$.waitFor([...stores.map(store => this.tokens.get(store))]);
  }
}

