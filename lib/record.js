// record / replay
// based on the the api from https://github.com/goatslacker/alt/blob/master/src/utils/DispatcherRecorder.js

// in your console,
// $$$.record() to start recording
// $$$.stop() to stop recording
// $$$.play() to replay the session

// todo - match timestamps, to be more realistic?

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = recorder;

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _indexJs = require('./index.js');

function timeout(t) {
  return new Promise(function (resolve) {
    return setTimeout(function () {
      return resolve();
    }, t);
  });
}

function recorder(dis) {

  var store;

  var $ = (0, _indexJs.act)(dis.dispatch, {
    record: '',
    stop: '',
    play: function play() {
      var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _step$value, action, args;

      return regeneratorRuntime.async(function play$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            context$2$0.prev = 3;
            _iterator = store.get().actions[Symbol.iterator]();

          case 5:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              context$2$0.next = 15;
              break;
            }

            _step$value = _slicedToArray(_step.value, 2);
            action = _step$value[0];
            args = _step$value[1];
            context$2$0.next = 11;
            return timeout(100);

          case 11:
            dis.dispatch.apply(dis, [action].concat(_toConsumableArray(args)));

          case 12:
            _iteratorNormalCompletion = true;
            context$2$0.next = 5;
            break;

          case 15:
            context$2$0.next = 21;
            break;

          case 17:
            context$2$0.prev = 17;
            context$2$0.t0 = context$2$0['catch'](3);
            _didIteratorError = true;
            _iteratorError = context$2$0.t0;

          case 21:
            context$2$0.prev = 21;
            context$2$0.prev = 22;

            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }

          case 24:
            context$2$0.prev = 24;

            if (!_didIteratorError) {
              context$2$0.next = 27;
              break;
            }

            throw _iteratorError;

          case 27:
            return context$2$0.finish(24);

          case 28:
            return context$2$0.finish(21);

          case 29:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[3, 17, 21, 29], [22,, 24, 28]]);
    }
  });

  $.log = function () {
    return console.log(store.get());
  };

  var oldRegister = dis.register;
  dis.register = function (initial, reduce, compare) {
    var state;
    return oldRegister(initial, function (o, action) {
      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      switch (action) {
        case $.record:
          state = o;
          return o;

        case $.play:
          return state;
      }
      return reduce.apply(undefined, [o, action].concat(args));
    }, compare);
  };

  store = oldRegister({
    recording: false,
    playing: false,
    actions: []
  }, function (o, action) {
    for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      args[_key2 - 2] = arguments[_key2];
    }

    switch (action) {
      case $.record:
        return _extends({}, o, {
          recording: true,
          actions: []
        });

      case $.stop:
        return _extends({}, o, {
          recording: false
        });

      case $.play:
        return _extends({}, o, {
          playing: true
        });

      case $.play.done:
        console.log('done replaying');
        return _extends({}, o, {
          playing: false
        });

      default:
        return o.recording ? _extends({}, o, {
          actions: o.actions.concat([[action, args]])
        }) : o;
    }
  });

  global.$$$ = $;

  return dis;
}

module.exports = exports['default'];