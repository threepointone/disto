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

  var resourcePath = this.resourcePath;
  if (/[\\/]webpack[\\/]buildin[\\/]module\.js|[\\/]react-hot-loader[\\/]|[\\/]react[\\/]lib[\\/]/.test(resourcePath)) {
    return this.callback(null, source, map);
  }

  var acceptUpdates = this.query !== '?manual',
      filename = _path2['default'].basename(resourcePath),
      separator = '\n\n',
      prependText = '',
      appendText = '',
      node,
      result;

  // put your stuff here

  prependText = '\n  var __couch__ = function(x){ return x; };\n  if(module.hot){\n    module.hot.accept(function(err){\n      if (err) {\n        console.error("disto.hot.error: " + ' + JSON.stringify(filename) + ' + err.message);\n      }\n    });\n\n\n    var __index__ = 0;\n    var __data__ = module.hot.data || {};\n    __data__.reduceFns = __data__.reduceFns || [];\n    __data__.stores = __data__.stores || [];\n    __couch__ = function (fn){\n      return (function(i){\n        return function (initial, reduce, compare){\n          if(__data__.stores[i]){\n            __data__.reduceFns[i] = reduce;\n            return __data__.stores[i];\n          }\n          else{\n            __data__.reduceFns[i] = reduce;\n            const store = __data__.stores[i] = fn(initial, function(){\n              return __data__.reduceFns[i].apply(null, arguments);\n            }, compare);\n          }\n\n          __index__++;\n          return store;\n        };\n      })(__index__);\n    };\n    module.hot.dispose(function(data){\n      data.reduceFns = __data__.reduceFns;\n      data.stores = __data__.stores;\n    });\n  }\n  ';

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