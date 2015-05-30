import path from 'path';
import acorn from 'acorn';
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
    module.hot.accept();
    var __index__ = 0;
    module.hot.data = module.hot.data || {};
    module.hot.data.reduceFns = module.hot.data.reduceFns || [];
    module.hot.data.stores = module.hot.data.stores || [];
    __couch__ = function (fn){
      return (function(i){
        return function (initial, reduce, compare){
          if(module.hot.data.stores[i]){
            module.hot.data.reduceFns[i] = reduce;
            return module.hot.data.stores[i];
          }
          else{
            module.hot.data.reduceFns[i] = reduce;
            const store = module.hot.data.stores[i] = fn(initial, function(){
              return module.hot.data.reduceFns[i].apply(null, arguments);
            }, compare);
          }

          __index__++;
          return store;
        };
      })(__index__);
    };
    module.hot.dispose(function(data){
      data.reduceFns = module.hot.data.reduceFns;
      data.stores = module.hot.data.stores;
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
