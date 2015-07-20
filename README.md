disto
---

flux in a jiffy.

`npm install redux disto --save`

```js
import {Flux} from 'disto';

...
<Flux stores={stores} actions={actions}>{
  state, $ => <App/>
}</Flux>
```

```js
let counter = (o = {count: 0}, action) =>
  (action.type === 'inc') ?  {count: o.count + 1} : o;

export class App {
  render() {
    return <Flux stores={{counter}} actions={{inc: () => ({type:'inc'})}}>{
      ({counter}, $) =>
        <div onClick={$.inc}>
          clicked {counter.count} times
        </div>
    }</Flux>;
  }
}
```

built with [redux](https://github.com/gaearon/redux)

