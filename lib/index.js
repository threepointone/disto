'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.act = act;
exports.debug = debug;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fluxLibInvariant = require('flux/lib/invariant');

var _fluxLibInvariant2 = _interopRequireDefault(_fluxLibInvariant);

var _flux = require('flux');

function last(arr) {
  return arr[arr.length - 1];
}

// @class Dis
// every app should have one central dispatcher
// all messages must go through this dispatcher
// all state changes happen synchronously with every message

var Dis = (function () {
  function Dis() {
    var _this = this;

    _classCallCheck(this, Dis);

    this.$ = new _flux.Dispatcher(); // we use the OG dispatcher under the hood
    this.tokens = new WeakMap(); // store all the tokens returned by the dipatcher
    ['register', 'unregister', 'dispatch', 'waitFor'] // bind these functions, so you can pass them around
    .forEach(function (fn) {
      return _this[fn] = _this[fn].bind(_this);
    });
  }

  _createClass(Dis, [{
    key: 'register',
    value: function register(initial) {
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

          if (typeof opts === 'function') {
            opts = { onNext: opts };
          }
          var onNext = opts.onNext || function (x) {
            return x;
          };
          handlers.push(onNext);
          // run it once to send initial value
          onNext(state);
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

      this.tokens.set(store, this.$.register(function (payload) {
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
    }
  }, {
    key: 'unregister',
    value: function unregister(store) {
      (0, _fluxLibInvariant2['default'])(store, 'cannot unregister nothing');
      (0, _fluxLibInvariant2['default'])(this.tokens.has(store), 'was not a registered store'); // should this be silent?
      this.$.unregister(this.tokens.get(store));
      this.tokens['delete'](store);
      return this;
    }
  }, {
    key: 'dispatch',

    // synchronous message dispatch
    value: function dispatch(action) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      (0, _fluxLibInvariant2['default'])(action, 'cannot dispatch a blank action');
      this.$.dispatch({ action: action, args: args });
      return this;
    }
  }, {
    key: 'waitFor',

    // beware, this is synchronous
    value: function waitFor() {
      var _this2 = this;

      for (var _len2 = arguments.length, stores = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        stores[_key2] = arguments[_key2];
      }

      (0, _fluxLibInvariant2['default'])(stores.length > 0, 'cannot wait for no stores');
      this.$.waitFor([].concat(_toConsumableArray(stores.map(function (store) {
        return _this2.tokens.get(store);
      }))));
      return this;
    }

    // todo - .destroy();

  }]);

  return Dis;
})();

exports.Dis = Dis;

// ACTIONS

function act(dispatch, bag, prefix) {
  var path = arguments[3] === undefined ? [] : arguments[3];

  (0, _fluxLibInvariant2['default'])(bag, 'cannot have a null descriptor');
  var o = {};
  // this is the nice bit,
  // with dispatches and bunnies
  function toFn(fn /* (ch) => {}*/) {
    var f = function f(action) {
      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      dispatch.apply(undefined, [f, action].concat(args));
      fn.apply(undefined, [action].concat(args));
    };
    return f;
  }

  // this is the ugly bit. thank god for tests, eh?
  return Object.keys(bag).reduce(function (ret, key) {
    (0, _fluxLibInvariant2['default'])(key !== 'dispatch', 'reserved word');
    var $path = key.split('.');
    var F,
        desc = bag[key];
    if (typeof desc === 'function') {
      F = toFn(desc);
    } else if (desc === '') {
      F = toFn(function () {});
    } else {
      F = Object.assign(toFn(function () {}), act(dispatch, desc, prefix, path.concat(key)));
    }

    F.isAction = true; // for debugging

    F.toString = F.inspect = function () {
      return (prefix ? [prefix] : []).concat(['~']) //⚡
      .concat(path).concat(key).join(':');
    };

    if ($path.length > 1) {
      $path.slice(0, $path.length - 1).reduce(function (_o, seg) {
        return _o[seg] || Object.assign(_o, _defineProperty({}, seg, {}))[seg];
      }, ret)[last($path)] = F;
    } else {
      ret[key] = F;
    }
    return ret;
  }, o);
}

// outputs an array of actions on the object. *sometimes*

function debug(acts) {
  return Object.keys(acts).reduce(function (arr, key) {
    return acts[key].isAction ? arr.concat(acts[key].toString()).concat(debug(acts[key])) : arr;
  }, []);
}