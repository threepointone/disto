"use strict";

var emitMixin = require('emitter-mixin');

export function sto(initial, fn){
  var state = initial;
  var F = function(action, ...args){
    if(action){
      state = fn(state, action, ...args);
      if(state === undefined){
        console.warn('have you forgotten to return state?')
      }
      F.emit('change', state);
    }
    return state;
  };

  emitMixin(F);
  return F;
}


// utitlities to convert to react style observables
export function toOb(store){
  return {
    subscribe(opts){
      opts = Object.assign({
        onNext: ()=>{}
      }, opts);

      var fn = ()=> opts.onNext(store());
      store.on('change', fn);
      fn();
      return {
        dispose(){
          store.off('change', fn);
        }
      }
    }
  }
}

export function toObs(ko){
  return Object.keys(ko).reduce((o, key) => Object.assign(o, {[key]: toOb(ko[key]) }), {});
}
