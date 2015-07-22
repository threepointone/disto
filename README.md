disto
---

flux as a component. built with [redux](https://github.com/gaearon/redux).

`npm install redux react-redux redux-thunk disto --save`

```js
import {Flux, COnnect} from 'disto';

...
<Flux stores={stores} actions={actions}>{
  state, $ => <App/>
}</Flux>

// stores are reducer functions
let counter = (o = {count: 0}, action) =>
  (action.type === 'inc') ?  {count: o.count + 1} : o;

// action creators are functions that generate actions
let inc =  () => ({type:'inc'})

// make a top level flux component with stores and actions
export class App {
  render() {
    return <Flux stores={{counter}} actions={{inc}}>{
      ({counter}, $) =>
        <div onClick={$.inc}>
          clicked {counter.count} times
        </div>
    }</Flux>;
  }
}

// deeper in the tree / in sub components,
// you can hook up to app state without passing props

export class Elsewhere{
  render(){
    return <Connect select={ state => state.counter.count} actions={actions}>{
      count, $ => <div> clicked {count} times </div>
    }</Connect>
  }
}

```
