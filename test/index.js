"use strict";
require('chai').should();

const {sto, Dis, act, mix, toObs, toOb} = require('../index');

describe('sto', ()=>{
  it('initializes with seed value', ()=>{
    var s = sto({x:1, y:2})().should.eql({x:1, y:2})
  });

  it('responds to actions / returns current state', ()=>{
    var s = sto({x: 1, y:2}, (o, action, key, val=1) => (action==='inc') ? Object.assign(o, {[key]: o[key] + val}) : o);
    s('inc', 'x', 5);
    s().x.should.eql(6);
  })

  it('emits change event', done => {
    var s = sto({times: 0}, (state, action) => ({times: state.times+1}));
    s.on('change', ()=> done());
    s('gogogo');    
  })

  it('can be converted to an rxjs style observable');
  // toOb, toObs
})

describe('Dis', ()=>{
  // const dis = new Dis(),
  //   {dispatch, register, unregister, waitfor} = dis;

  it('can register|unregister stores, and send messages to all registered stores', ()=>{
    var d = new Dis(), s = sto(0, state => state+1);
    var h = d.register(s);
    
    d.dispatch('xyz'); d.dispatch('xyz'); d.dispatch('xyz');
    
    s().should.eql(3);
    h.unregister();

    d.dispatch('xyz'); d.dispatch('xyz'); d.dispatch('xyz');
    s().should.eql(3);
  })

  it('can waitfor stores before proceeding', ()=>{
    var d = new Dis();
    var s1 = sto(0, x => x+1);
    var s2 = sto(0, x => x+2);
    var s3 = sto(0, x => {d.waitfor(s1, s2); return (s1() + s2())});
    [s3, s1, s2].map(d.register);
    d.dispatch('xyz');
    s3().should.eql(3);
  })

})

describe('act', ()=>{
  it('can parse descriptor strings', ()=>{
    var stringify = JSON.stringify;
    stringify(act(`{a {done} b c {done1 done2}}`)).should.eql('{"a":{"done":{}},"b":{},"c":{"done1":{},"done2":{}}}');
    stringify(act(`{a b c}`)).should.eql('{"a":{},"b":{},"c":{}}');    
    act(`{a b}`).a.should.not.eql(act(`{a b}`).a)
  })
  it('has dev friendly string representations', ()=>{
    act(`{x {a b {done} c} y z }`,'myApp').x.b.done.toString().should.eql('myApp:x:b:done');
  })
})

describe('mix', ()=>{
  it('can mixin observables onto react components')
})

