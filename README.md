disto
---

flux in a jiffy.

`npm install redux disto --save`

```js
import {Flux} from 'disto';

...
<Flux stores={{key: (state = initial, action) => state}}>{
  state, dispatch => <App/>
}</Flux>
```

```js
let counter = (o = {count: 0}, action) =>
  (action.type === 'inc') ?  {count: o.count + 1} : o;

let actions = {
  inc: '', // dispatches .type === 'inc'
  decAsync: async function(){
    await sleep(1000);
  }   // dispatches .type === 'dec'
      // and then .type ==='dec.done' after 1 second
};

export class App {
  render() {
    return <Flux stores={{counter}} actions={{inc: ''}}>{
      ({counter}, dispatch) =>
        <div onClick={() => $.inc()}>
          clicked {counter.count} times
        </div>
    }</Flux>;
  }
}
```

built with [redux](https://github.com/gaearon/redux)

