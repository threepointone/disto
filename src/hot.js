// todo - unregister on unload

export function register(dis, m){
  if(!m.hot){
    return dis.register;
  }
  let fn = dis.register;
  m.hot.data = m.hot.data || {};
  m.hot.data.dhl = m.hot.data.dhl || {};
  let dhl = m.hot.data.dhl;
  m.hot.sIndex = m.hot.sIndex || 0;

  dhl.reduceFns = dhl.reduceFns || [];
  dhl.stores = dhl.stores || [];
  let couched = (initial, reduce, compare) => (i => {
    dhl.reduceFns[i] = reduce;
    if(!dhl.stores[i]){
      dhl.stores[i] = fn(initial, function(){
        return dhl.reduceFns[i].apply(null, arguments);
      }, compare);
    }
    m.hot.sIndex++;
    return dhl.stores[i];

  })(m.hot.sIndex);



  if(!m.hot.sAttached){
    m.hot.sAttached = true;
    m.hot.addDisposeHandler(data => {
      Object.assign(data, {
        dhl: {
          ...data.dhl,
          reduceFns: dhl.reduceFns,
          stores: dhl.stores
        }
      });
    });
  }
  return couched;
}

export function act(dis, m){
  if(!m.hot){
    return dis.act;
  }
  let fn = dis.act;
  m.hot.data = m.hot.data || {};
  m.hot.data.dhl = m.hot.data.dhl || {};
  let dhl = m.hot.data.dhl;
  m.hot.aIndex = m.hot.aIndex || 0;

  dhl.acts = dhl.acts || [];
  dhl.maps = dhl.maps || [];

  let couched = (map, prefix) => {
    return (i => {
      dhl.maps[i] = map;
      if(!dhl.acts[i]){
        dhl.acts[i] = fn(Object.keys(map).reduce((o, key)=>
          Object.assign(o, {[key]: (...args) => {
            if(dhl.maps[i][key]){
              return dhl.maps[i][key](...args);
            }
          }}),
        {}), prefix);
      }

      m.hot.aIndex++;
      return dhl.acts[i];

    })(m.hot.aIndex);

  };

  if(!m.hot.aAttached){
    m.hot.aAttached = true;
    m.hot.addDisposeHandler(data => Object.assign(data, {
      dhl: {
        ...data.dhl,
        acts: dhl.acts,
        maps: dhl.maps
      }
    }));
  }
  return couched;
}


export function hot(dis, m){
  return {
    register: register(dis, m),
    act: act(dis, m)
  };
}
