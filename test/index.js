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
  const dis = new Dis(),
    {dispatch, register, unregister, waitfor} = dis;

   it('can register stores')
   it('can unregister stores')
   it('can dispatch messages to all registered stores')
   it('can waitfor stores before proceeding')

})

describe('act', ()=>{
  it('can parse descriptor strings',  ()=>{
    var stringify = JSON.stringify;
    stringify(act(`{a {done} b c {done1 done2}}`)).should.eql('{"a":{"done":{}},"b":{},"c":{"done1":{},"done2":{}}}');
    stringify(act(`{a b c}`)).should.eql('{"a":{},"b":{},"c":{}}');
    act(`{x {a b {done} c} y z }`,'myApp').x.b.done.toString().should.eql('myApp:x:b:done');
    act(`{a b}`).a.should.not.eql(act(`{a b}`).a)
  })
})

describe('mix', ()=>{
  it('can mixin observables onto react components')
})

