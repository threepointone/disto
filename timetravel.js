import {Dis} from './index';
import {photo, record} from './record';

let {register, dispatch, lock, unlock} = new Dis();

let store = photo(register({x: 0}, o => ({x: o.x+1}))); // simple increments

store.subscribe(o => console.log(o.x)); // 0
let t1 = store.snapshot();
dispatch('xyz');  // 1
dispatch('xyz');  // 2
dispatch('xyz');  // 3
dispatch('xyz');  // 4

let t2 = store.snapshot();
dispatch('xyz');  // 5
dispatch('xyz');  // 6

lock();
dispatch('xyz');  // ignored
dispatch('xyz');  // ignored

store.goTo(t1);   // 0
console.log(store.get());       // {x:0}

store.goTo(t2);   // 4

store.restore();  // 6
console.log(store.get());      // {x: 6}

unlock();
dispatch('xyz');  // 7
dispatch('xyz');  // 8





