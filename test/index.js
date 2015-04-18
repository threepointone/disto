"use strict";
require('chai').should();

const {sto, Dis, act, toObs, toOb} = require('../index');

describe('sto', ()=>{
  it('initializes with seed value', ()=>{
    var s = sto({x:1, y:2})().should.eql({x:1, y:2})
  });

  it('responds to actions / returns current state', ()=>{
    var s = sto({x: 1, y:2}, 
      (o, action, key, val=1) => (action==='inc') ? Object.assign(o, {[key]: o[key] + val}) : o);
    s('inc', 'x', 5);
    s().x.should.eql(6);
  })

  it('emits change event', done => {
    var s = sto({times: 0}, (state, action) => ({times: state.times+1}));
    s.on('change', ()=> {
      s().times.should.eql(1);
      done();
    });
    s('gogogo');    
  })

  it('does not emit change when state hasn\'t changed', done => {
    var s1 = sto(3, (num, action) => {
      if(action==='inc'){
        return num + 1;
      }
      return num;
    });
    s1.on('change', (oldS, newS)=> {
      done('should not fire');
    })
    s1('xyz');  
    done();
  })

  it('!!does not emit change when same object is mutated and returned!!!', done => {
    // this is by design!  
    var s1 = sto({x: 0}, (state, action) => Object.assign(state, {x: state.x+1}));
    s1.on('change', (oldS, newS)=> {
      done(true);
    });
    s1('xyz');

    // so if you're using object.assign, make sure you start with a fresh object
    var s2 = sto({x: 0}, (state, action) => Object.assign({}, state, {x: state.x+1}));
    s2.on('change', (oldS, newS)=> {
      done();
    });
    s2('xyz');
  })  

  it('however, you can use a custom equality check', done => {
    // be careful with this. 
    function eql(a, b){
      return false;
    }

    var s = sto({x: 0}, (state, action) => Object.assign(state, {x: state.x+2}), eql);
    s.on('change', (newS, oldS)=> {
      (newS===oldS).should.be.ok;
      // ick, mutable shared object
      newS.x.should.eql(2);
      done();
    })
    s('xyz');
  })


  it('can be converted to an rxjs style observable', (done)=>{
    var s = sto(0, x => x+1);    
    var ob = toOb(s);
    var {dispose} = ob.subscribe({onNext: state => state.should.eql(0) && done() });
    dispose();
  });
  // toOb, toObs
})

describe('Dis', ()=>{
  it('can register|unregister stores, and send messages to all registered stores', ()=>{
    var d = new Dis(), s = sto(0, state => state+1);
    var h = d.register(s);
    
    d.dispatch('xyz'); d.dispatch('xyz'); d.dispatch('xyz');
    
    s().should.eql(3);
    d.unregister(s);

    d.dispatch('xyz'); d.dispatch('xyz'); d.dispatch('xyz');
    s().should.eql(3);
  })

  it('can waitFor stores before proceeding', ()=>{
    var d = new Dis();
    var s1 = sto(0, x => x+1);
    var s2 = sto(0, x => x+2);
    var s3 = sto(0, x => {d.waitFor(s1, s2); return (s1() + s2())});
    [s3, s2, s1].map(d.register);
    d.dispatch('xyz');
    s1().should.eql(1);
    s2().should.eql(2);
    s3().should.eql(3);
  })

  it('can detect circular dependencies', ()=>{
    var d = new Dis();
    var s1 = ({}, (o) => { d.waitFor(s2); return o;});
    var s2 = ({}, (o) => { d.waitFor(s1); return o;});
    [s1, s2].map(d.register);
    (() => d.dispatch('xyz')).should.throw();
  })

})

describe('act', ()=>{
  it('can parse descriptor strings', ()=>{
    var stringify = JSON.stringify;

    stringify(act(`{a {done} b c {done1 done2}}`))
      .should.eql('{"a":{"done":{}},"b":{},"c":{"done1":{},"done2":{}}}');
    
    stringify(act(`{a b c}`))
      .should.eql('{"a":{},"b":{},"c":{}}');    
    
    act(`{a b {some { nested { path } distraction}} c}`)
      .b.some.nested.path.should.be.ok
    
    act(`{a b}`).a.should.not.eql(act(`{a b}`).a)
  })

  it('has dev friendly string representations', ()=>{
    act(`{x { a b {done} c } y z }`,'myApp')
      .x.b.done.toString().should.eql('myApp:x:b:done');
  })
})