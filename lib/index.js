'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.app = app;

var _require = require('./flux.js');

var Dis = _require.Dis;
var debug = _require.debug;
exports.Dis = Dis;
exports.debug = debug;
var hot = require('./hot.js').hot;
exports.hot = hot;
var record = require('./record.js');
exports.record = record;
var mix = require('./mix.js');

exports.mix = mix;
// singleton!
var singleton;

function app() {
  var config = arguments[0] === undefined ? { record: true } : arguments[0];

  if (!singleton) {
    singleton = new Dis();
    if (config.record) {
      singleton.dev = record.setup(singleton, module);
    }
  }
  return singleton;
}