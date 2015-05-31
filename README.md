disto
---

- strictly follows the original [flux](http://facebook.github.io/flux) architecture
- a simple api, with no new concepts
- stores and action creators are just functions
- shorthand notation for action creators, with async function / promise support
- [live editing experience](https://github.com/threepointone/disto-hot-loader) across action creators / stores / views
- [timetravel utilities](https://github.com/threepointone/disto-example/blob/master/_rest/record.js)
- includes mixin to polyfill [sideloading data on components](https://github.com/facebook/react/issues/3398)
- react-native compatible, because apparently that's a thing now
- i love you

`npm install disto --save`

```js
// the dispatcher uses the facebook dispatcher under the hood

var dispatcher = new Dis();

dispatcher.register(initialState, fn, compare)

dispatcher.unregister(store)

dispatcher.dispatch(action, ...args)

dispatcher.waitFor(...stores)

// Stores are represented as initial state + a function
// that get called on every [actions, ...args] message
// that passes through the "system".

let store = dispatcher.register({
  q: '',
  res: [],     // initial state
  err: null
}, function(state, action, ...args) {
  switch(action){

    case 'QUERY':
      let [q] = args;
      return {
        ...state, q
      };

    case 'QUERY_DONE':
      let [err, res] = args;
      return {
        ...state, err, res
      };

    default:
      return state;
  }
});

store.get()   // returns current value

// stores are also lightweight 'observables',

var {dispose} = store.subscribe(fn)

// we use this to hook on to react components via the .observe() polyfill

// notice the conspicuous lack of a .setState()

// Actions can be whatever you please.
// We include a helper to make debug friendly action collections
// It's quite funky. See the unit tests and examples for more details.

// [action docs coming soon]

```

tests
---
`npm test`