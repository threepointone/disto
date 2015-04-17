(work in progress)

another take on flux, influenced by observables 
---

[flux](http://facebook.github.io/flux), facebook's take on app architecture

Here, stores are represented as reduce functions on every [actions, ...args] message that passes through the "system".

```js
var store = sto({q: '', res:[], err: null},
  (state, action, ...args)=>{
    switch(action){
      case actions.query: 
        let [q] = args;
        return Object.assign(state, {q: q});
      case actions.query.done:
        let [err, res] = args;
        Object.assign(state, err || res.error ? 
          {err : err || res.error, res: []} : 
          {err : null, res: res.body.data})
    }
  })

// These are observable event emitters, with the following apis

store.on('change', fn)  
store.off('change', fn)

store()   // returns current value
store(action, ...args) // triggers the reduce function

// notice the conspicuous lack of a .setState()

There are also a couple of helpers to convert this to an rxjs style observable
toOb(store)  // "to Observable"
toObs({store1, store2, ...stores})  // to Observables

```

Neat!

We also have a dispatcher. There are many like it, but this is mine. 

```js
var dis = new Dis()

dis.register(store)
dis.unregister(store)

dis.dispatch(action,...args)

dis.waitfor(stores)

```

Actions are plain functions / whatever you please. However, we have a helper to generate action constants. 
```js
var $ = act(`{
  search { done } 
  details { done } 
  select 
  mousemove
  backToList 
  some { nested { action1 action2 }}}`, 'myApp');
 
 
print($);
// {
//  "search": {
//   "done": {}
//  },
//  "details": {
//   "done": {}
//  },
//  "select": {},
//  "mousemove": {},
//  "backToList": {},
//  "some": {
//   "nested": {
//    "action1": {},
//    "action2": {}
//   }
//  }
// }
 
$.search.done === $.details.done;
// false
 
console.log($.some.nested.action1 + '');
// "myApp:some:nested:action1"
 
// use with a dispatcher
dispatch($.search, "red shoes");
 
// use with a store
var store = sto({}, (state, action, ...args)=>{
  switch(action){
    case $.mousemove:
      let [e] = args;
      return {x:e.pageX, y:e.pageY};
    default: 
      return state;
  }
})

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
        {this.state.data.store1.toJS()}
        {this.state.data.store2.toJS()}
      </div>
    );
  }
});
```


We also have tests!

