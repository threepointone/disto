'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _acorn = require('acorn');

var _acorn2 = _interopRequireDefault(_acorn);

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

  prependText = '\n  var __couch__ = function(x){ return x; };\n  if(module.hot){\n    module.hot.accept();\n    var __index__ = 0;\n    module.hot.data = module.hot.data || {};\n    module.hot.data.reduceFns = module.hot.data.reduceFns || [];\n    module.hot.data.stores = module.hot.data.stores || [];\n    __couch__ = function (fn){\n      return (function(i){\n        return function (initial, reduce, compare){\n          if(module.hot.data.stores[i]){\n            module.hot.data.reduceFns[i] = reduce;\n            return module.hot.data.stores[i];\n          }\n          else{\n            module.hot.data.reduceFns[i] = reduce;\n            const store = module.hot.data.stores[i] = fn(initial, function(){\n              return module.hot.data.reduceFns[i].apply(null, arguments);\n            }, compare);\n          }\n\n          __index__++;\n          return store;\n        };\n      })(__index__);\n    };\n    module.hot.dispose(function(data){\n      data.reduceFns = module.hot.data.reduceFns;\n      data.stores = module.hot.data.stores;\n    });\n  }\n  ';

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