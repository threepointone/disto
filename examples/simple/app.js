import React from 'react';
import {Flux} from '../../src';

import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';

let counter = (o = {count: 0}, action) =>
  (action.type === 'inc') ?  {count: o.count + 1} : o;

export class App {
  render() {
    return <Flux stores={{counter}} actions={{inc: () => ({type:'inc'})}}>{
      ({counter}, $, store) =>
        <div onClick={$.inc}>
          clicked {counter.count} times

          <DebugPanel top right bottom>
            <DevTools store={store} monitor={LogMonitor} />
          </DebugPanel>

        </div>
    }</Flux>;
  }
}

