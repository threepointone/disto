import React from 'react';
import {Flux} from '../../src';

import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';

let stores = {
  counter(o = {count: 0}, action) {
    return (action.type === 'inc') ?  {count: o.count + 2} : o;
  }
}

let actions = {
  inc: () => ({type:'inc'})
};

export class App {
  render() {
    return <Flux stores={stores} actions={actions}>{
      ({counter}, $, store) =>
        <div onClick={$.inc}>
          clicked {counter.count} times
        {/*
          <DebugPanel top right bottom>
            <DevTools store={store} monitor={LogMonitor} />
          </DebugPanel>
        */}
        </div>
    }</Flux>;
  }
}





