import invariant from 'flux/lib/invariant';

function last(arr) {
  return arr[arr.length - 1];
}

export default function act(dispatch, bag, prefix, path=[]) {
  invariant(bag, 'cannot have a null descriptor');
  var o = {};
  // this is the nice bit,
  // with dispatches and bunnies
  function toFn(fn /* (ch) => {}*/){
    var f = function(action, ...args) {
      dispatch(f, action, ...args);
      fn(action, ...args);
    };
    return f;
  }

  // this is the ugly bit. thank god for tests, eh?
  return Object.keys(bag).reduce((ret, key)=> {
    invariant(key!=='dispatch', 'reserved word');
    var $path = key.split('.');
    var F, desc = bag[key];
    if (typeof desc === 'function'){
      F = toFn(desc);
    }
    else if(desc===''){
      F = toFn(()=>{});
    }
    else{
      F = Object.assign(toFn(()=>{}),
              act(dispatch, desc, prefix, path.concat(key)));
    }

    F.isAction = true; // for debugging

    F.toString = F.inspect = () =>
      (prefix? [prefix]: [])
      .concat(['~']) //⚡
      .concat(path)
      .concat(key)
      .join(':');

    if($path.length>1){
      $path.slice(0, $path.length-1).reduce((_o, seg) =>
        _o[seg] || Object.assign(_o, {
          [seg]: {}
        })[seg], ret)[last($path)] = F;
    }

    else {
      ret[key] = F;
    }
    return ret;
  }, o);
}

// outputs an array of actions on the object. *sometimes*
export function debug(acts){
  return Object.keys(acts)
    .reduce((arr, key) => acts[key].isAction ?
      arr.concat(acts[key]+'').concat(debug(acts[key])) :
      arr, []);
}
