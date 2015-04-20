import invariant from 'flux/lib/invariant';
import {chan, putAsync} from 'js-csp';

export default function act(dispatch, bag, prefix, path=[]) {
  invariant(bag, 'cannot have a null descriptor');
  var o = {};
  function toChan(fn /* (ch) => {}*/){
    var c = chan();
    fn.call(o, c);
    var f = function(...args) {
      dispatch(f, ...args);
      putAsync(c, args)       
    }
    return f;
  }

  return Object.keys(bag).reduce((o, key)=> {   
    invariant(key!=='dispatch', 'reserved word');
    var $path = key.split('.');
    var F, desc = bag[key], F;
    if (typeof desc === 'function') 
      F = toChan(desc)    
    else if(desc==='') 
      F = toChan(()=>{})
    else 
      F = Object.assign(toChan(()=>{}), 
        act(dispatch, desc, prefix, path.concat(key)));
      
    F.__isAct = true; // for debugging

    F.toString = F.inspect = () => ['⚡️'].concat(
      prefix? [prefix]: []).concat(path).concat(key).join(':')
    
    o[key] = F;
    return o;
  }, o)
}

export function spont(fn){
  return ch =>  go(function*(){
    while(true) fn(...(yield ch));
  })
}

export function debug(acts){
  return Object.keys(acts)
    .reduce((arr, key) => acts[key].__isAct ? 
      arr.concat(acts[key]+'').concat(debug(acts[key])) : 
      arr, [])
}

export function channelDecorator(){
  // use as decorator on react classes
}