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

export class App {
  render() {
    return <Flux stores={{counter}}>{
      ({counter}, dispatch) =>
        <div onClick={() => dispatch({type: 'inc'})}>
          clicked {counter.count} times
        </div>
    }</Flux>;
  }
}
```

built with [redux](https://github.com/gaearon/redux)

