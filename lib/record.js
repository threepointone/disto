// snapshot / record / replay
// based on the the api from https://github.com/goatslacker/alt/blob/master/src/utils/DispatcherRecorder.js

// todo - match timestamps, to be more realistic?

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var helpers = {
  snapshot: function snapshot() {
    this.dispatch(constants.snapshot);
  },
  goTo: function goTo(i) {
    this.dispatch(constants.goTo, i);
  },
  record: function record() {
    this.dispatch(constants.record);
  },
  stop: function stop() {
    this.dispatch(constants.stop);
  },
  play: function play() {
    var i = 0;
    var t = this;
    this.dispatch(constants.play);
    var intval = setInterval(function () {
      var _t$recorderStore$get$actions$i = _slicedToArray(t.recorderStore.get().actions[i], 2);

      var action = _t$recorderStore$get$actions$i[0];
      var args = _t$recorderStore$get$actions$i[1];

      t.dispatch.apply(t, [action].concat(_toConsumableArray(args)));
      i++;
      if (i === t.recorderStore.get().actions.length) {
        clearInterval(intval);
        t.dispatch(constants.playDone);
      }
    }, 100);
  }
};

exports.helpers = helpers;
var initial = {
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
        recording: true,
        actions: []
      });

    case constants.stop:
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
        actions: o.actions.concat([[action, args]])
      }) : o;
  }
}

function setup(dis, sto) {
  dis.recorderStore = sto;
  var regi = dis.register; // slip by disto-hot :S
  dis.register = function (init, red, comp) {
    var state,
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
          state = o;
          return o;

        case constants.play:
          return state;

        case constants.stop:
          return o;

        case constants.playDone:
          return o;
      }
    }
    return regi(init, function (o, action) {
      for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        args[_key3 - 2] = arguments[_key3];
      }

      return use.apply(undefined, [o, action].concat(args)) || red.apply(undefined, [o, action].concat(args));
    }, comp);
  };
  Object.assign(dis, helpers);
}