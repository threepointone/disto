"use strict";

import invariant from 'flux/lib/invariant';
import {Dispatcher} from 'flux';
import {EventEmitter} from 'events';
import emitMixin from 'emitter-mixin';

// @class Dispatcher 
// every app should have one central dispatcher
// all messages must go through this dispatcher 
// all state changes happen synchronously with every message
export class Dis extends EventEmitter {
  constructor() {
    super();
    // we use the OG dispatcher under the hood 
    this.$ = new Dispatcher();
    // store all the tokens returned by the dipatcher 
    this.tokens = new WeakMap();
    
    // bind these functions, so you can pass them around 
    ['register', 'unregister', 'dispatch', 'waitFor']
      .forEach(fn => this[fn] = this[fn].bind(this));
  }

  register(store) {
    invariant(store, 'cannot register a blank store')
    this.tokens.set(store, this.$.register(function(payload) {
      // dispatch the action onto the store
      store(payload.action, ...payload.args);
    }));
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
    this.$.dispatch({
      action, args
    });
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
  // the 'handler' function called on every action 
  // you are expected to return state every time  
  areEqual = (a, b) => a === b
  // equality check function
  // used to determine 'change'  
){         
  if(typeof initial === 'function') {
    console.warn('have you forgotten to pass an initial state?');
  }

  var state = initial;  // hold onto the state here
  var F = function(action, ...args) {
    if (action) {
      // message dispatch, trigger reduce step
      var oldState = state;
      state = fn(state, action, ...args);
      (state === undefined)  && console.warn('have you forgotten to return state?')
      F.emit('action', action, ...args); // DON'T USE THIS TO CHANGE STATE ELSEWHERE
      if (!areEqual(state, oldState)) {
        F.emit('change', state, oldState); // ~~~do~~~
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
  return Object.keys(ko).reduce((o, key) => Object.assign(o, {
    [key]: toOb(ko[key])
  }), {});
}

// https://gist.github.com/threepointone/57ec4e29e2770e67c24b
let [BRA, KET, IDENT] = ['BRA', 'KET', 'IDENT'];

function last(arr) {
  return arr[arr.length - 1]
}

// fuck it, we'll do it live!
export function act(src, prefix) {
  let tree = src.split('').reduce((tokens, char) => {
      if (char === '{' || char === '}' || /\s/.test(char)) {
        if (tokens.identBuffer) {
          tokens.push({
            type: IDENT,
            val: tokens.identBuffer.join('')
          });
          tokens.identBuffer = null;
        }
      }
      if (char === '{') tokens.push({
        type: BRA
      });
      if (char === '}') tokens.push({
        type: KET
      });

      if (/[a-z0-9]/i.test(char)) {
        tokens.identBuffer = tokens.identBuffer || [];
        tokens.identBuffer.push(char);
      }
      return tokens;
    }, [])
    .reduce((stack, token) => {
      switch (token.type) {
        case BRA:
          stack.push([]);
          break;

        case KET:
          if (stack.length === 1) break;
          let children = stack.pop();
          last(last(stack)).children = children;
          break;

        case IDENT:
          last(stack).push(token);
          break;

        default:
          break;
      }
      return stack;
    }, [])[0];

  return toObj(tree);

  function toObj(arr, path = []) {
    return arr.reduce((o, node) =>
      Object.assign(o, {
        [node.val]: Object.assign({
            toString: () => (prefix ? [prefix] : []).concat(path).concat(node.val).join(':') // prefix?:path:to:action
          },
          node.children ? toObj(node.children, path.concat(node.val)) : {})
      }), {});
  }
}