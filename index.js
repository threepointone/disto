"use strict";

import invariant from 'flux/lib/invariant';
import {Dispatcher} from 'flux';
import {EventEmitter} from 'events';
import emitMixin from 'emitter-mixin';

// todo - test for invariant conditions

export class Dis extends EventEmitter {
  constructor() {
    super();
    this.tokens = new WeakMap();
    this.$ = new Dispatcher();
    ['register', 'unregister', 'dispatch', 'waitFor'].forEach(fn => this[fn] = this[fn].bind(this));
  }

  register(store) {
    invariant(store, 'cannot register a blank store')
    this.tokens.set(store, this.$.register(function(payload) {
      store(payload.action, ...payload.args);
    }));
  }

  unregister(store) {
  	invariant(store, 'cannot unregister nothing');
  	invariant(this.tokens.has(store), 'was not a registered store') // should this be silent?
    this.$.unregister(this.tokens.get(store));
    this.tokens.delete(store);
  }

  dispatch(action, ...args) {
    invariant(action, 'cannot dispatch a blank action');
    this.$.dispatch({
      action, args
    });
  }

  waitFor(...stores) {
    invariant(stores.length > 0, 'cannot wait for no stores');
    this.$.waitFor([...stores.map(store => this.tokens.get(store))]);
  }
}

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
      if (!areEqual(state, oldState)) {
        F.emit('change', state, oldState);
      }
    }
    return state;
  };
  return emitMixin(F);
}

// utitlities to convert stores to react style observables
export function toOb(store) {
  return {
    subscribe(opts) {
      opts = Object.assign({
        onNext: () => {}
      }, opts);
      var fn = state => opts.onNext(state);
      store.on('change', fn);
      // run it once to send initial value
      fn(store());
      return {
        dispose() {
          store.off('change', fn);
        }
      };
    }
  }
}

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
            toString: () => (prefix ? [prefix] : []).concat(path).concat(node.val).join(':')
          },
          node.children ? toObj(node.children, path.concat(node.val)) : {})
      }), {});
  }
}