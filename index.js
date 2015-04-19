"use strict";

import invariant from 'flux/lib/invariant';
import {Dispatcher} from 'flux';
import {EventEmitter} from 'events';
import emitMixin from 'emitter-mixin';

// @class Dis 
// every app should have one central dispatcher
// all messages must go through this dispatcher 
// all state changes happen synchronously with every message
export class Dis extends EventEmitter {
  constructor() {
    super();    
    this.$ = new Dispatcher();  // we use the OG dispatcher under the hood     
    this.tokens = new WeakMap();  // store all the tokens returned by the dipatcher 
    ['register', 'unregister', 'dispatch', 'waitFor'] // bind these functions, so you can pass them around 
      .forEach(fn => this[fn] = this[fn].bind(this));
  }

  register(store) {
    invariant(store, 'cannot register a blank store')
    // register the store, and store the token it returns locally 
    this.tokens.set(store,
      this.$.register(payload => store(payload.action, ...payload.args)));
  }

  unregister(store) {
    invariant(store, 'cannot unregister nothing');
    invariant(this.tokens.has(store), 'was not a registered store') // should this be silent?
    this.$.unregister(this.tokens.get(store));
    this.tokens.delete(store);
  }

  // synchronous message dispatch
  dispatch(action, ...args) {
    invariant(action, 'cannot dispatch a blank action');
    this.$.dispatch({ action, args });
    // we also fire an action event, so you could conceptually pipe this to a log, etc 
    this.emit('action', action, ...args);
  }

  // beware, this is synchronous
  waitFor(...stores) {
    invariant(stores.length > 0, 'cannot wait for no stores');
    this.$.waitFor([...stores.map(store => this.tokens.get(store))]);
  }
}

// stores
export function sto(
  initial, 
  // initial state    
  
  fn = (state, action, ...args) => state, 
  // the 'handler'/reduce function called on every action 
  // you are expected to return state every time  
  
  areEqual = (a, b) => a === b
  // equality check function
  // used to determine 'change'  
){         
  if(typeof initial === 'function') {
    console.warn('have you forgotten to pass an initial state?');
  }
  var state = initial;  // hold onto the state here

  // we return a function that 
  // either accepts no arguments, and returns current state
  // accepts an [action, ...args] message and passes on to 
  // the store's reduce function
  var F = function(action, ...args) {
    if (action) {      
      var oldState = state;
      // message dispatch, trigger reduce step
      state = fn(state, action, ...args);
      (state === undefined)  && console.warn('have you forgotten to return state?')
      F.emit('action', action, ...args);    // DON'T USE THIS TO CHANGE STATE ELSEWHERE
      if (!areEqual(state, oldState)) {
        F.emit('change', state, oldState);  // ~~~do~~~
      }
    }
    return state;
  };
  return emitMixin(F); // this potentially lets us treat it as an observable/channel/whatever
}

// observable: {
//   subscribe: (observer: {
//     onNext: (value) -> (),
//     onError: (err) -> (),
//     onCompleted: () -> ()
//   }) -> (subscription: {
//     dispose: () -> ()
//   }))
// }

// convert a store to an observable
export function toOb(store) {
  return {
    subscribe(opts) {
      opts = Object.assign({onNext: () => {}}, opts);
      var fn = state => opts.onNext(state);
      store.on('change', fn);
      // run it once to send initial value
      fn(store());
      return {dispose() {store.off('change', fn);}};
    }
  }
}

// convert a keyed collection of stores to observables
export function toObs(ko) {
  return Object.keys(ko).reduce((o, key) => Object.assign(o, {[key]: toOb(ko[key])}), {});
}