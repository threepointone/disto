(work in progress)

disto 
---
the shredder's js framework

another take on [flux](http://facebook.github.io/flux), influenced by observables/channels.

```js
// Here, stores are represented as reduce functions 
// on every [actions, ...args] message that passes through the "system".

var store = sto({q: '', res:[], err: null},  // initial state
  (state, action, ...args)=>{
    switch(action){
      
      case actions.query: 
        let [q] = args;
        return Object.assign({}, state, {q: q});
      
      case actions.query.done:
        let [err, res] = args;
        return Object.assign(state, err || res.error ? 
          {err : err || res.error, res: []} : 
          {err : null, res: res.body.data})
    }
    return state;
  })

// These are observable event emitters, with the following apis

store.on/off('action', fn)  
store.on/off('change', fn)  

store()   // returns current value
store(action, ...args) // triggers the reduce function

// notice the conspicuous lack of a .setState()

// there are also a couple of helpers to convert this to an rxjs style observable

// to Observable
toOb(store)  

// to Observables
toObs({store1, store2, ...stores})  

// Neat!

// We also have a dispatcher. 
// It uses the facebook dispatcher under the hood, with a nicer api for these stores.

var dis = new Dis()

dis.register(store)
dis.unregister(store)

dis.dispatch(action, ...args)

dis.waitFor(...stores)

// Actions can be whatever you please. 
// We include a helper to make debug friendly action collections
// It's quite funky. See `./act.js` and the examples for more details. 

```

Also included is @gaearon's [superb take](https://gist.github.com/gaearon/7d94c9f38fdd34a6e690) on a polyfill for [side loading data](https://github.com/facebook/react/issues/3398)
```js
var App = React.createClass({
  mixins: [mix],
  observe: function(){
    return toObs({store1, store2})
  },
  render: function() {
    return (
      <div className="App">
        {this.state.data.store1}
        {this.state.data.store2}
      </div>
    );
  }
});
```

