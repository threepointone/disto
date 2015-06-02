'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.Dis = Dis;
exports.act = act;
exports.debug = debug;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var invariant = require('flux/lib/invariant');

var _require = require('flux');

var Dispatcher = _require.Dispatcher;

var slice = [].slice;

// @class Dis
// every app should have one central dispatcher
// all messages must go through this dispatcher
// all state changes happen synchronously with every message

function Dis() {
  var _this = this;

  this.$ = new Dispatcher(); // we use the OG dispatcher under the hood
  this.tokens = new WeakMap(); // store all the tokens returned by the dipatcher
  ['register', 'unregister', 'dispatch', 'waitFor'] // bind these functions, so you can pass them around
  .forEach(function (fn) {
    return _this[fn] = _this[fn].bind(_this);
  });
}

Dis.prototype.register = function (initial) {
  var reduce = arguments[1] === undefined ? function (o) {
    return o;
  } : arguments[1];
  var compare = arguments[2] === undefined ? function (a, b) {
    return a === b;
  } : arguments[2];

  var state = initial,
      handlers = [];

  var store = {
    get: function get() {
      return state;
    },
    subscribe: function subscribe() {
      var opts = arguments[0] === undefined ? {} : arguments[0];
      var immediate = arguments[1] === undefined ? true : arguments[1];

      if (typeof opts === 'function') {
        opts = { onNext: opts };
      }
      var onNext = opts.onNext || function (x) {
        return x;
      };
      handlers.push(onNext);
      // run it once to send initial value
      if (immediate) {
        onNext(state);
      }
      return {
        dispose: function dispose() {
          handlers = handlers.filter(function (x) {
            return x !== onNext;
          });
          onNext = null;
        }
      };
    }
  };

  var reg = this.$.register.bind(this.$);
  // this is to trip up disto-hot
  // i know, i know :(

  this.tokens.set(store, reg(function (payload) {
    var prevState = state;
    state = reduce.apply(undefined, [state, payload.action].concat(_toConsumableArray(payload.args))); // the only line worth anything in this library
    if (state === undefined) {
      console.warn('have you forgotten to return state?');
    }
    if (!compare(prevState, state)) {
      handlers.forEach(function (fn) {
        return fn(state, prevState);
      });
    }
    prevState = null;
  }));

  return store;
};

Dis.prototype.unregister = function (store) {
  invariant(store, 'cannot unregister nothing');
  invariant(this.tokens.has(store), 'was not a registered store'); // should this be silent?
  this.$.unregister(this.tokens.get(store));
  this.tokens['delete'](store);
  return this;
};

// synchronous message dispatch
Dis.prototype.dispatch = function (action) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  invariant(action, 'cannot dispatch a blank action');
  this.$.dispatch({ action: action, args: args });
  return this;
};

// beware, this is synchronous
Dis.prototype.waitFor = function () {
  var _this2 = this;

  invariant(arguments.length > 0, 'cannot wait for no stores');
  this.$.waitFor(slice.call(arguments, 0).map(function (store) {
    return _this2.tokens.get(store);
  }));
  return this;
};

// ACTIONS

function act(dispatch, map, prefix) {
  var o = {};
  Object.keys(map).forEach(function (key) {
    var fn = map[key] || function () {};
    o[key] = function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      dispatch.apply(undefined, [o[key]].concat(args));
      var p = fn.apply(undefined, args);
      if (p instanceof Promise) {
        p.then(function (res) {
          return o[key].done(null, res);
        })['catch'](function (err) {
          return o[key].done(err);
        });
      }
      return p;
    };

    o[key].toString = function () {
      return [prefix || '', '~', key].filter(function (x) {
        return !!x;
      }).join(':');
    };
    o[key].done = function () {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return dispatch.apply(undefined, [o[key].done].concat(args));
    };
    o[key].done.toString = function () {
      return [prefix || '', '~', key, 'done'].filter(function (x) {
        return !!x;
      }).join(':');
    };
  });
  return o;
}

// outputs an array of actions on the object.

function debug(acts) {
  return Object.keys(acts).map(function (x) {
    return acts[x].toString();
  });
}