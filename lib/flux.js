'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.debug = debug;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fluxLibInvariant = require('flux/lib/invariant');

var _fluxLibInvariant2 = _interopRequireDefault(_fluxLibInvariant);

var _flux = require('flux');

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
    ['register', 'unregister', 'dispatch', 'waitFor', 'act'] // bind these functions, so you can pass them around
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
  }, {
    key: 'act',
    value: function act(map, prefix) {
      var _this3 = this;

      var o = {};

      function str() {
        for (var _len3 = arguments.length, k = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          k[_key3] = arguments[_key3];
        }

        return [prefix || '', '~'].concat(k).filter(function (x) {
          return !!x;
        }).join(':');
      }

      Object.keys(map).forEach(function (key) {
        var fn = map[key] || function () {};
        o[key] = function () {
          for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
          }

          _this3.dispatch.apply(_this3, [o[key]].concat(args));
          var p = fn.apply(undefined, args);
          if (p instanceof Promise) {
            p.then(function (res) {
              return o[key].done(res);
            })['catch'](function (err) {
              return o[key].error(err);
            });
          }
          return p;
        };

        o[key].toString = function () {
          return str(key);
        };

        o[key].done = function () {
          for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
            args[_key5] = arguments[_key5];
          }

          return _this3.dispatch.apply(_this3, [o[key].done].concat(args));
        };
        o[key].done.toString = function () {
          return str(key, 'done');
        };

        o[key].error = function () {
          for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            args[_key6] = arguments[_key6];
          }

          return _this3.dispatch.apply(_this3, [o[key].error].concat(args));
        };
        o[key].error.toString = function () {
          return str(key, 'error');
        };
      });
      return o;
    }
    // todo - .destroy();

  }]);

  return Dis;
})();

exports.Dis = Dis;

// outputs an array of actions on the object.

function debug(acts) {
  return Object.keys(acts).map(function (x) {
    return acts[x].toString();
  });
}