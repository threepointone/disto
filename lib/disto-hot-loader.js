'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _sourceMap = require('source-map');

var _sourceMap2 = _interopRequireDefault(_sourceMap);

var _makeIdentitySourceMap = require('./makeIdentitySourceMap');

var _makeIdentitySourceMap2 = _interopRequireDefault(_makeIdentitySourceMap);

var SourceNode = _sourceMap2['default'].SourceNode;
var SourceMapConsumer = _sourceMap2['default'].SourceMapConsumer;

exports['default'] = function (source, map) {
  if (this.cacheable) {
    this.cacheable();
  }

  console.log('loader', this.resourcePath);

  var resourcePath = this.resourcePath;
  if (/[\\/]webpack[\\/]buildin[\\/]module\.js|[\\/]react-hot-loader[\\/]|[\\/]disto-hot-loader[\\/]|[\\/]react[\\/]lib[\\/]/.test(resourcePath)) {
    return this.callback(null, source, map);
  }

  var acceptUpdates = this.query !== '?manual',
      filename = _path2['default'].basename(resourcePath),
      separator = '\n\n',
      prependText = '',
      appendText = '',
      node,
      result;

  if (this.sourceMap === false) {
    return this.callback(null, [prependText, source, appendText].join(separator));
  }

  if (!map) {
    map = (0, _makeIdentitySourceMap2['default'])(source, this.resourcePath);
  }

  node = new SourceNode(null, null, null, [new SourceNode(null, null, this.resourcePath, prependText), SourceNode.fromStringWithSourceMap(source, new SourceMapConsumer(map)), new SourceNode(null, null, this.resourcePath, appendText)]).join(separator);

  result = node.toStringWithSourceMap();

  this.callback(null, result.code, result.map.toString());
};

module.exports = exports['default'];