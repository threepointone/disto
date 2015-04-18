(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.disto = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: key == null || typeof Symbol == 'undefined' || key.constructor !== Symbol, configurable: true, writable: true }); };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = parse;
'use strict';
// https://gist.github.com/threepointone/57ec4e29e2770e67c24b
var BRA = 'BRA';
var KET = 'KET';
var IDENT = 'IDENT';

function last(arr) {
  return arr[arr.length - 1];
};

function parse(src, prefix) {
  var tree = src.split('').reduce(function (tokens, char) {
    if (char === '{' || char === '}' || /\s/.test(char)) {
      if (tokens.identBuffer) {
        tokens.push({ type: IDENT, val: tokens.identBuffer.join('') });
        tokens.identBuffer = null;
      }
    }
    if (char === '{') {
      tokens.push({ type: BRA });
    }
    if (char === '}') {
      tokens.push({ type: KET });
    }
    if (/[a-z0-9]/i.test(char)) {
      tokens.identBuffer = tokens.identBuffer || [];
      tokens.identBuffer.push(char);
    }
    return tokens;
  }, []).reduce(function (stack, token) {
    switch (token.type) {
      case BRA:
        stack.push([]);
        break;
      case KET:
        if (stack.length === 1) break;
        var children = stack.pop();
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

  function toObj(arr) {
    var path = arguments[1] === undefined ? [] : arguments[1];

    return arr.reduce(function (o, node) {
      return Object.assign(o, _defineProperty({}, node.val, Object.assign({ toString: function toString() {
          return (prefix ? [prefix] : []).concat(path).concat(node.val).join(':');
        } }, node.children ? toObj(node.children, path.concat(node.val)) : {})));
    }, {});
  }
}

module.exports = exports['default'];

},{}],2:[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (initializers) initializers[key] = descriptor.initializer; } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _autobind = require('autobind-decorator');

var _autobind2 = _interopRequireWildcard(_autobind);

var EventEmitter = require('events').EventEmitter;
var invariant = require('invariant');

var Dispatcher = (function (_EventEmitter) {
  function Dispatcher() {
    _classCallCheck(this, Dispatcher);

    _get(Object.getPrototypeOf(Dispatcher.prototype), 'constructor', this).call(this);this.stores = [];this.registers = new WeakMap();
  }

  _inherits(Dispatcher, _EventEmitter);

  _createDecoratedClass(Dispatcher, [{
    key: 'register',
    decorators: [_autobind2['default']],
    value: function register(store) {
      var _this = this;

      invariant(store instanceof Function, 'store must be a valid function');
      this.stores.push(store);
      // because the dispatcher is a central point for the stores,
      // it makes sense to have a change listener here
      var fn = function fn(e) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        return _this.emit.apply(_this, ['change', store].concat(args));
      };
      store.on('change', fn);
      this.registers.set(store, fn);
    }
  }, {
    key: 'unregister',
    decorators: [_autobind2['default']],
    value: function unregister(store) {
      var fn = this.registers.get(store);
      !fn && console.warn('this store is not registered');
      store.off('change', fn);
      this.stores = this.stores.filter(function (x) {
        return x != store;
      });
      this.registers['delete'](store);
    }
  }, {
    key: '_process',
    value: function _process(store, action) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      invariant(this.running, 'cannot process when not running');
      if (!this._processed.get(store)) {
        store.apply(undefined, [action].concat(args));
        this._processed.set(store, true);
      }
    }
  }, {
    key: 'dispatch',
    decorators: [_autobind2['default']],
    value: function dispatch(action) {
      var _this2 = this;

      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      invariant(!this.running, 'cannot dispatch while another\'s going on');
      invariant(action, 'cannot dispatch a blank action');
      this.running = true;
      this._currentAction = action;
      this._currentArgs = args;

      this._processed = new WeakMap();
      this.stores.map(function (store) {
        return _this2._process.apply(_this2, [store, action].concat(args));
      });

      delete this._processed;
      delete this._currentAction;
      delete this._currentArgs;

      this.running = false;
      this.emit.apply(this, ['action', action].concat(args));
    }
  }, {
    key: 'waitfor',
    decorators: [_autobind2['default']],
    value: function waitfor() {
      var _this3 = this;

      for (var _len4 = arguments.length, stores = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        stores[_key4] = arguments[_key4];
      }

      invariant(this.running, 'cannot waitfor when no message is being sent');
      invariant(stores.length > 0, 'cannot wait for no stores');
      stores.forEach(function (store) {
        return _this3._process.apply(_this3, [store, _this3._currentAction].concat(_toConsumableArray(_this3._currentArgs)));
      });
    }
  }]);

  return Dispatcher;
})(EventEmitter);

module.exports = Dispatcher;

},{"autobind-decorator":5,"events":9,"invariant":7}],3:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

module.exports = _extends({}, require('./sto'), {
	Dis: require('./dis'),
	act: require('./act'),
	mix: require('./mix')
});

},{"./act":1,"./dis":2,"./mix":4,"./sto":8}],4:[function(require,module,exports){
"use strict";

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: key == null || typeof Symbol == "undefined" || key.constructor !== Symbol, configurable: true, writable: true }); };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
"use strict";

// via @dan_abramov https://gist.github.com/gaearon/7d94c9f38fdd34a6e690

exports["default"] = {
  getInitialState: function getInitialState() {
    var data = {};

    this.subscribe(this.props, this.context, function (key, value) {
      data[key] = value;
    });
    this.unsubscribe();

    return { data: data };
  },

  componentWillMount: function componentWillMount() {
    this.subscribe(this.props, this.context, this.setData);
  },

  componentWillReceiveProps: function componentWillReceiveProps(props, context) {
    this.subscribe(props, context, this.setData);
  },

  componentWillUnmount: function componentWillUnmount() {
    this.unsubscribe();
  },

  setData: function setData(key, value) {
    this.setState({
      data: _extends({}, this.state.data, _defineProperty({}, key, value))
    });
  },

  subscribe: function subscribe(props, context, onNext) {
    var newObservables = this.observe(props, context);
    var newSubscriptions = {};

    var _loop = function (key) {
      newSubscriptions[key] = newObservables[key].subscribe({
        onNext: (function (_onNext) {
          function onNext(_x) {
            return _onNext.apply(this, arguments);
          }

          onNext.toString = function () {
            return _onNext.toString();
          };

          return onNext;
        })(function (value) {
          return onNext(key, value);
        }),
        onError: function onError() {},
        onCompleted: function onCompleted() {}
      });
    };

    for (var key in newObservables) {
      _loop(key);
    }

    this.unsubscribe();
    this.subscriptions = newSubscriptions;
  },

  unsubscribe: function unsubscribe() {
    for (var key in this.subscriptions) {
      if (this.subscriptions.hasOwnProperty(key)) {
        this.subscriptions[key].dispose();
      }
    }

    this.subscriptions = {};
  }
};
module.exports = exports["default"];

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
/**
 * @copyright 2015, Andrey Popp <8mayday@gmail.com>
 *
 * The decorator may be used on classes or methods
 * ```
 * @autobind
 * class FullBound {}
 *
 * class PartBound {
 *   @autobind
 *   method () {}
 * }
 * ```
 */
exports['default'] = autobind;

function autobind() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  if (args.length === 1) {
    return boundClass.apply(undefined, args);
  } else {
    return boundMethod.apply(undefined, args);
  }
}

/**
 * Use boundMethod to bind all methods on the target.prototype
 */
function boundClass(target) {
  // (Using reflect to get all keys including symbols)
  Reflect.ownKeys(target.prototype).forEach(function (key) {
    // Ignore special case target method
    if (key === 'constructor') return;

    var descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);

    // Only methods need binding
    if (typeof descriptor.value === 'function') {
      Object.defineProperty(target.prototype, key, boundMethod(target, key, descriptor));
    }
  });
  return target;
}

/**
 * Return a descriptor removing the value and returning a getter
 * The getter will return a .bind version of the function
 * and memoize the result against a symbol on the instance
 */
function boundMethod(target, key, descriptor) {
  var _key = undefined;
  var fn = descriptor.value;

  if (typeof fn !== 'function') {
    throw new Error('@autobind decorator can only be applied to methods not: ' + typeof fn);
  }

  if (typeof key === 'string') {
    // Add the key to the symbol name for easier debugging
    _key = Symbol('@autobind method: ' + key);
  } else if (typeof key === 'symbol') {
    // A symbol cannot be coerced to a string
    _key = Symbol('@autobind method: (symbol)');
  } else {
    throw new Error('Unexpected key type: ' + typeof key);
  }

  return {
    configurable: true, // must be true or we could not be changing it
    get: function get() {
      if (!this.hasOwnProperty(_key)) {
        this[_key] = fn.bind(this);
      }
      return this[_key];
    }
  };
}
module.exports = exports['default'];

},{}],6:[function(require,module,exports){

/**
 * dependencies.
 */

var Emitter = require('events').EventEmitter
  , proto = Emitter.prototype;

/**
 * expsoe `mixin`
 *
 * @param {Object} obj
 */

module.exports = function (obj) {

  // mixin

  for (var k in proto) {
    obj[k] = proto[k];
  }

  // events getter.

  obj.__defineGetter__('_events', function () {
    return this.__events || (this.__events = {});
  });

  // events setter.

  obj.__defineSetter__('_events', function (val) {
    this.__events = val;
  });

  /**
   * Remove all listeners for `event`.
   *
   * if the method is executed without
   * arguments it will remove all listeners,
   * otherwise you can supply `event` or
   * `event` with `fn` for more specific stuff.
   *
   * example:
   *
   *          obj.on('foo', console.log)._events;
   *          // > { foo: fn, }
   *          obj.on('foo', console.dir)._events;
   *          // > { foo: [fn, fn] }
   *          obj.off('foo', console.log)._events;
   *          // > { foo: [fn] }
   *          obj.off('foo');
   *          // > {}
   *          obj.off();
   *          // > {}
   *
   * @param {String} event
   * @param {Function} fn
   * @return {self}
   */

  obj.off = function (event, fn) {
    switch (arguments.length) {
      case 2:
        this.removeListener(event, fn);
        return this;
      case 1:
        this.removeAllListeners(event);
        return this;
      case 0:
        this.removeAllListeners();
        return this;
    }
  };


  // all done
  return obj;
};

},{"events":9}],7:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

'use strict';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (process.env.NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

}).call(this,require('_process'))
},{"_process":10}],8:[function(require,module,exports){
'use strict';

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: key == null || typeof Symbol == 'undefined' || key.constructor !== Symbol, configurable: true, writable: true }); };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.sto = sto;

// utitlities to convert to react style observables
exports.toOb = toOb;
exports.toObs = toObs;
'use strict';

var emitMixin = require('emitter-mixin');

function sto(initial, fn) {
  var state = initial;
  var F = (function (_F) {
    function F(_x, _x2) {
      return _F.apply(this, arguments);
    }

    F.toString = function () {
      return _F.toString();
    };

    return F;
  })(function (action) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (action) {
      state = fn.apply(undefined, [state, action].concat(args));
      if (state === undefined) {
        console.warn('have you forgotten to return state?');
      }
      F.emit('change', state);
    }
    return state;
  });

  emitMixin(F);
  return F;
}

function toOb(store) {
  return {
    subscribe: function subscribe(opts) {
      opts = Object.assign({
        onNext: function onNext() {}
      }, opts);

      var fn = function fn() {
        return opts.onNext(store());
      };
      store.on('change', fn);
      fn();
      return {
        dispose: function dispose() {
          store.off('change', fn);
        }
      };
    }
  };
}

function toObs(ko) {
  return Object.keys(ko).reduce(function (o, key) {
    return Object.assign(o, _defineProperty({}, key, toOb(ko[key])));
  }, {});
}

},{"emitter-mixin":6}],9:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],10:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[3])(3)
});