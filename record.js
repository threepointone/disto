import invariant from 'flux/lib/invariant';

export function photo(store){
  var snapshots = [], active = false, index = -1, handlers = [];

  function get(){
    return active ? snapshots[index] : store.get();
  }

  function trigger(){
    handlers.forEach(x => x(get()));
  }

  function subscribe(opts){
    if(typeof opts === 'function'){
      opts = {onNext: opts};
    }
    let onNext = opts.onNext || (x => x);
    handlers.push(onNext);
    var once = false;
    let {dispose} = store.subscribe(function(...args){
      // discard first value
      if(!once){
        once = true;
      }
      else{
        onNext(...args);
      }

    });
    onNext(get());

    return {dispose() {
      handlers = handlers.filter(x => x !== onNext);
      dispose();
    }};

  }

  function snapshot(){
    invariant(!active, 'cannot snapshot when in time warp');
    snapshots.push(store.get());
    return snapshots.length -1;
  }

  function goTo(shot){
    active = true;
    index = shot;
    trigger();
  }

  function restore(){
    active = false;
    index = -1;
    trigger();
  }

  return {
    get,
    subscribe,
    snapshot,
    goTo,
    restore
  };
}
