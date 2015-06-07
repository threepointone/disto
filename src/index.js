
export const {Dis, debug} = require('./flux.js');
export const hot = require('./hot.js').hot;
export const record = require('./record.js');
export const mix = require('./mix.js');

// singleton!
var singleton;
export function app(config = {record: true}){
  if(!singleton){
    singleton = new Dis();
    if(config.record){
      singleton.dev = record.setup(singleton, module);
    }
  }
  return singleton;
}

