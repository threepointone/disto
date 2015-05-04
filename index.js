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
    this.$ = new Dispatcher();    // we use the OG dispatcher under the hood
    this.tokens = new WeakMap();  // store all the tokens returned by the dipatcher
    ['register', 'unregister', 'dispatch', 'waitFor'] // bind these functions, so you can pass them around
      .forEach(fn => this[fn] = this[fn].bind(this));
  }

  register(store) {
    invariant(store, 'cannot register a blank store');
    // register the store, and store the token it returns locally
    this.tokens.set(store,
      this.$.register(payload => store(payload.action, ...payload.args)));
    return this;
  }

  unregister(store) {
    invariant(store, 'cannot unregister nothing');
    invariant(this.tokens.has(store), 'was not a registered store'); // should this be silent?
    this.$.unregister(this.tokens.get(store));
    this.tokens.delete(store);
    return this;
  }

  // synchronous message dispatch
  dispatch(action, ...args) {
    invariant(action, 'cannot dispatch a blank action');
    this.$.dispatch({ action, args });
    // we also fire an action event, so you could pipe this to a log, etc
    this.emit('action', action, ...args);
    return this;
  }

  // beware, this is synchronous
  waitFor(...stores) {
    invariant(stores.length > 0, 'cannot wait for no stores');
    this.$.waitFor([...stores.map(store => this.tokens.get(store))]);
    return this;
  }

  // todo - .destroy();
}
// STORES
// stores
export function sto(
  initial,
  // initial state

  reduce = (state, action, ...args) => state,
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
  // or accepts an [action, ...args] message and passes on to
  // the store's reduce function
  var F = function(action, ...args) {
    if (action) {
      var oldState = state;
      // message dispatch, trigger reduce step
      state = reduce(state, action, ...args);
      // todo - determine that the message came from the dispatcher?
      if(state === undefined){
        console.warn('have you forgotten to return state?');
      }
      F.emit('action', action, ...args);    // DON'T USE THIS TO CHANGE STATE ELSEWHERE
      if (!areEqual(state, oldState)) {
        F.emit('change', state, oldState);  // ~~~do~~~
      }
    }
    return state;
  };
  return emitMixin(F); // this potentially lets us treat it as an observable/channel/whatever
}

// OBSERVABLES

// an observable follows this structure
// observable: {
//   subscribe: (observer: {
//     onNext: value -> (),
//     onError: err -> (),
//     onCompleted: () -> ()
//   }) -> (subscription: {
//     dispose: () -> ()
//   }))
// }

// convert a store to an observable
export function toOb(store) {
  invariant(store, 'not a store');
  return {
    subscribe(opts={}) {
      let onNext = opts.onNext || (x => x);
      store.on('change', onNext);
      // run it once to send initial value
      onNext(store());
      return {dispose() {store.off('change', onNext); }};
    }
  };
}

// convert a keyed collection of stores to observables
export function toObs(ko) {
  return Object.keys(ko).reduce((o, key) => Object.assign(o, {[key]: toOb(ko[key])}), {});
}

// ACTIONS

function last(arr) {
  return arr[arr.length - 1];
}

export function act(dispatch, bag, prefix, path=[]) {
  invariant(bag, 'cannot have a null descriptor');
  var o = {};
  // this is the nice bit,
  // with dispatches and bunnies
  function toFn(fn /* (ch) => {}*/){
    var f = function(action, ...args) {
      dispatch(f, action, ...args);
      fn(action, ...args);
    };
    return f;
  }

  // this is the ugly bit. thank god for tests, eh?
  return Object.keys(bag).reduce((ret, key)=> {
    invariant(key!=='dispatch', 'reserved word');
    var $path = key.split('.');
    var F, desc = bag[key];
    if (typeof desc === 'function'){
      F = toFn(desc);
    }
    else if(desc===''){
      F = toFn(()=>{});
    }
    else{
      F = Object.assign(toFn(()=>{}),
              act(dispatch, desc, prefix, path.concat(key)));
    }

    F.isAction = true; // for debugging

    F.toString = F.inspect = () =>
      (prefix? [prefix]: [])
      .concat(['~']) //⚡
      .concat(path)
      .concat(key)
      .join(':');

    if($path.length>1){
      $path.slice(0, $path.length-1).reduce((_o, seg) =>
        _o[seg] || Object.assign(_o, {
          [seg]: {}
        })[seg], ret)[last($path)] = F;
    }

    else {
      ret[key] = F;
    }
    return ret;
  }, o);
}

// outputs an array of actions on the object. *sometimes*
export function debug(acts){
  return Object.keys(acts)
    .reduce((arr, key) => acts[key].isAction ?
      arr.concat(acts[key]+'').concat(debug(acts[key])) :
      arr, []);
}
