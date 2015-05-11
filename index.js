import invariant from 'flux/lib/invariant';
import {Dispatcher} from 'flux';

// @class Dis
// every app should have one central dispatcher
// all messages must go through this dispatcher
// all state changes happen synchronously with every message
export class Dis {
  constructor() {
    // super();
    this.$ = new Dispatcher();    // we use the OG dispatcher under the hood
    this.tokens = new WeakMap();  // store all the tokens returned by the dipatcher
    this.actions = []; // store all actions. todo - max length
    this.running = true; // used to lock/unlock
    ['register', 'unregister', 'dispatch', 'waitFor', 'lock', 'unlock'] // bind these functions, so you can pass them around
      .forEach(fn => this[fn] = this[fn].bind(this));

  }

  register(initial, reduceFn = o => o, compare = (a, b) => a === b){
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

     var state = initial, handlers = [];

    const store = {
      get: ()=> state,
      subscribe(opts={}){
        if(typeof opts === 'function'){
          opts = {onNext: opts};
        }
        let onNext = opts.onNext || (x => x);
        handlers.push(onNext);
        // run it once to send initial value
        onNext(store.get());
        return {dispose() {
          handlers = handlers.filter(x => x !== onNext);
        }};
      }
    };

    this.tokens.set(store,
      this.$.register(payload => {
        var prevState = state;
        state = reduceFn(state, payload.action, ...payload.args); // shared mutable state. iknorite.
        if(state === undefined){
          console.warn('have you forgotten to return state?');
        }
        if(!compare(prevState, state)){
          handlers.forEach(fn => fn(state, prevState));
        }
      }));

    return store;
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
    if(this.running){
      invariant(action, 'cannot dispatch a blank action');
      this.$.dispatch({ action, args });
      this.actions.push([action, args, Date.now()]);
      // we also fire an action event, so you could pipe this to a log, etc
      // this.emit('action', action, ...args);
    }
    return this;
  }

  lock(){
    this.running = false;
  }

  unlock(){
    this.running = true;
  }

  // beware, this is synchronous
  waitFor(...stores) {
    invariant(stores.length > 0, 'cannot wait for no stores');
    this.$.waitFor([...stores.map(store => this.tokens.get(store))]);
    return this;
  }

  // todo - .destroy();
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
