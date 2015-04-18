"use strict";

var emitMixin = require('emitter-mixin');

export function sto(initial, fn= x => x)  {
  var state = initial;
  var F = function(action, ...args) {
    if (action) {
      var newState = fn(state, action, ...args);
      if (state === undefined) {
        console.warn('have you forgotten to return state?')
      }
      // need to assign before firing event        
      state = newState;
      F.emit('action', state);        
    }
    return state;
  };
  return emitMixin(F);
}


// utitlities to convert to react style observables
export function toOb(store) {
  return {
    subscribe(opts) {
      opts = Object.assign({
        onNext: () => {}
      }, opts);

      var fn = () => opts.onNext(store());
      store.on('action', fn);
      fn();
      return {
        dispose() {
          store.off('action', fn);
        }
      }
    }
  }
}

export function toObs(ko) {
  return Object.keys(ko).reduce((o, key) => Object.assign(o, {
    [key]: toOb(ko[key])
  }), {});
}