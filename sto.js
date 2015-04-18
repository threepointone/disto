"use strict";

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

// utitlities to convert to react style observables
export function toOb(store) {
  return {
    subscribe(opts) {
      opts = Object.assign({
        onNext: () => {}
      }, opts);

      var fn = () => opts.onNext(store());
      store.on('change', fn);
      // run it once to send initial value
      fn();
      return {
        dispose() {
          store.off('change', fn);
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