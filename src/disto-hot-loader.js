import path from 'path';
import SourceMap from 'source-map';
let {SourceNode, SourceMapConsumer} = SourceMap;

import makeIdentitySourceMap from './makeIdentitySourceMap';

export default function(source, map){
  if (this.cacheable) {
    this.cacheable();
  }


  var resourcePath = this.resourcePath;
  if (/[\\/]webpack[\\/]buildin[\\/]module\.js|[\\/]react-hot-loader[\\/]|[\\/]react[\\/]lib[\\/]/.test(resourcePath)) {
    return this.callback(null, source, map);
  }

  var acceptUpdates = this.query !== '?manual',
      filename = path.basename(resourcePath),
      separator = '\n\n',
      prependText = '',
      appendText = '',
      node,
      result;



  // put your stuff here


  prependText = `
  var __couch__ = function(x){ return x; };
  if(module.hot){
    module.hot.accept(function(err){
      if (err) {
        console.error("disto.hot.error: " + ${JSON.stringify(filename)} + err.message);
      }
    });


    var __index__ = 0;
    var __data__ = module.hot.data || {};
    __data__.reduceFns = __data__.reduceFns || [];
    __data__.stores = __data__.stores || [];
    __couch__ = function (fn){
      return (function(i){
        return function (initial, reduce, compare){
          if(__data__.stores[i]){
            __data__.reduceFns[i] = reduce;
            return __data__.stores[i];
          }
          else{
            __data__.reduceFns[i] = reduce;
            const store = __data__.stores[i] = fn(initial, function(){
              return __data__.reduceFns[i].apply(null, arguments);
            }, compare);
          }

          __index__++;
          return store;
        };
      })(__index__);
    };
    module.hot.dispose(function(data){
      data.reduceFns = __data__.reduceFns;
      data.stores = __data__.stores;
    });
  }
  `;

 if (this.sourceMap === false) {
    return this.callback(null, [
      prependText,
      source,
      appendText
    ].join(separator));
  }
  if (!map) {
    map = makeIdentitySourceMap(source, this.resourcePath);
  }

  node = new SourceNode(null, null, null, [
    new SourceNode(null, null, this.resourcePath, prependText),
    SourceNode.fromStringWithSourceMap(source, new SourceMapConsumer(map)),
    new SourceNode(null, null, this.resourcePath, appendText)
  ]).join(separator);

  result = node.toStringWithSourceMap();

  this.callback(null, result.code, result.map.toString());
}
