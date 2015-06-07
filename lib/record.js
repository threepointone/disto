// snapshot / record / replay
// based on the the api from https://github.com/goatslacker/alt/blob/master/src/utils/DispatcherRecorder.js

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.helpers = helpers;
exports.reduce = reduce;
exports.setup = setup;

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var constants = {
  snapshot: 'DISTO_SNAPSHOT',
  goTo: 'DISTO_GOTO',
  record: 'DISTO_RECORD',
  stop: 'DISTO_STOP',
  play: 'DISTO_PLAY',
  playDone: 'DISTO_PLAY_DONE'
};

function timeout(t) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, t);
  });
}

function helpers(dis, store) {
  var dispatch = dis.dispatch;

  var o = {
    snapshot: function snapshot() {
      dispatch(constants.snapshot);
    },
    goTo: function goTo(i) {
      dispatch(constants.goTo, i);
    },
    record: function record() {
      dispatch(constants.record);
    },
    stop: function stop() {
      dispatch(constants.stop);
    },
    play: function play() {
      var passed, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _step$value, action, args, time;

      return regeneratorRuntime.async(function play$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (store.get().recording) {
              o.stop();
            }
            passed = 0;

            dispatch(constants.play);
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            context$2$0.prev = 6;
            _iterator = store.get().actions[Symbol.iterator]();

          case 8:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              context$2$0.next = 20;
              break;
            }

            _step$value = _slicedToArray(_step.value, 3);
            action = _step$value[0];
            args = _step$value[1];
            time = _step$value[2];
            context$2$0.next = 15;
            return timeout(Math.max(time - passed, 0));

          case 15:
            dispatch.apply(undefined, [action].concat(_toConsumableArray(args)));
            passed = time;

          case 17:
            _iteratorNormalCompletion = true;
            context$2$0.next = 8;
            break;

          case 20:
            context$2$0.next = 26;
            break;

          case 22:
            context$2$0.prev = 22;
            context$2$0.t0 = context$2$0['catch'](6);
            _didIteratorError = true;
            _iteratorError = context$2$0.t0;

          case 26:
            context$2$0.prev = 26;
            context$2$0.prev = 27;

            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }

          case 29:
            context$2$0.prev = 29;

            if (!_didIteratorError) {
              context$2$0.next = 32;
              break;
            }

            throw _iteratorError;

          case 32:
            return context$2$0.finish(29);

          case 33:
            return context$2$0.finish(26);

          case 34:
            o.playDone();

          case 35:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this, [[6, 22, 26, 34], [27,, 29, 33]]);
    },
    playDone: function playDone() {
      dispatch(constants.playDone);
    }
  };

  return o;
}

var initial = {
  start: -1,
  recording: false,
  playing: false,
  actions: []
};

exports.initial = initial;

function reduce(o, action) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  switch (action) {
    case constants.record:
      return _extends({}, o, {
        start: Date.now(),
        recording: true,
        actions: []
      });

    case constants.stop:
      console.log('replacing');
      return _extends({}, o, {
        recording: false
      });

    case constants.play:
      return _extends({}, o, {
        playing: true
      });

    case constants.playDone:
      console.log('done replaying');
      return _extends({}, o, {
        playing: false
      });

    default:
      return o.recording ? _extends({}, o, {
        actions: o.actions.concat([[action, args, Date.now() - o.start]])
      }) : o;
  }
}

function setup(dis, m) {
  var register = (m ? require('./hot').hot(dis, m) : dis).register;
  var sto = register(initial, reduce);
  // todo - replace with plugin api
  dis.register = function (init, red, comp) {
    var recordStartState,
        snapshots = [];

    function use(o, action) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      switch (action) {
        case constants.snapshot:
          console.log('snapshot ' + snapshots.length);
          snapshots.push(o);
          return o;

        case constants.goTo:
          var i = args[0];

          if (!snapshots[i]) {
            console.error('snapshot ' + i + ' not available');
            return o;
          }
          return snapshots[i];

        case constants.record:
          recordStartState = o;
          return o;

        case constants.play:
          return recordStartState;

        case constants.stop:
          return o;

        case constants.playDone:
          return o;
      }
    }
    return register(init, function (o, action) {
      for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        args[_key3 - 2] = arguments[_key3];
      }

      return use.apply(undefined, [o, action].concat(args)) || red.apply(undefined, [o, action].concat(args));
    }, comp);
  };

  return helpers(dis, sto);
}