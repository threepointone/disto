/*global describe, it*/
// todo - tests for invariant conditions

function timeout(t){
  return new Promise(resolve => setTimeout(()=> resolve(), t));
}

require('chai').should();

import {Dis, act, debug} from '../src/index.js';

describe('sto', ()=>{
  it('initializes with seed value', ()=>{
    let dis = new Dis(),
      store = dis.register({x: 1, y: 2});
    store.get().should.eql({x: 1, y: 2});

  });

  it('responds to actions / returns current state', ()=> {
    let dis = new Dis(),
      s = dis.register({x: 1, y: 2},
      (o, action, key, val=1) => (action === 'inc') ? Object.assign(o, {[key]: o[key] + val}) : o);
    dis.dispatch('inc', 'x', 5);
    s.get().x.should.eql(6);
  });

  it('can subscribe to changes', done => {
    let dis = new Dis(),
      s = dis.register({times: 0}, state => ({times: state.times + 1}));
    let {dispose} = s.subscribe(()=> {
      s.get().times.should.eql(1);
      dispose();
      done();
    }, false);
    dis.dispatch('gogogo');
  });

  it('does not emit change when state hasn\'t changed', done => {
    let dis = new Dis(),
      s = dis.register(3, (num, action) => (action === 'inc') ? num + 1 : num);

    let {dispose} = s.subscribe(()=> done('should not fire'), false);
    dis.dispatch('xyz');
    dis.dispatch('xyz');
    dis.dispatch('xyz');
    dispose();
    done();
  }, false);

  it('!!does not emit change when same object is mutated and returned!!!', done => {
    // this is by design!
    let dis = new Dis(),
      s1 = dis.register({x: 0}, state => Object.assign(state, {x: state.x + 1}));

    s1.subscribe(()=> {
      done('should not fire');
    }, false);
    dis.dispatch('xyz');

    // so if you're using object.assign, make sure you start with a fresh object
    var s2 = dis.register({x: 0}, state => Object.assign({}, state, {x: state.x + 1}));
    s2.subscribe(()=> {
      done(); // will fire
    }, false);
    dis.dispatch('xyz');
  });

  it('however, you can use a custom equality check', done => {
    // be careful with this.
    function eql(){
      return false;
    }

    let dis = new Dis(),
      s = dis.register({x: 0}, (state) => Object.assign(state, {x: state.x + 2}), eql);

    s.subscribe(newS => {
      // ick, mutable shared object
      newS.x.should.eql(2);
      done();
    }, false);
    dis.dispatch('xyz');
  });


  it('is a react style observable', (done)=>{
    let dis = new Dis(),
      s = dis.register(0, x => x + 1);

    var {dispose} = s.subscribe({onNext: state => (state === 1) && done() });
    dis.dispatch('_');
    // dis.dispatch('_');
    dispose();
  });
});

describe('Dis', ()=>{
  it('can register|unregister stores, and send messages to all registered stores', ()=>{
    var d = new Dis(),
      s = d.register(0, state => state + 1);

    d.dispatch('xyz'); d.dispatch('xyz'); d.dispatch('xyz');

    s.get().should.eql(3);
    d.unregister(s);

    d.dispatch('xyz'); d.dispatch('xyz'); d.dispatch('xyz');
    s.get().should.eql(3);
  });

  it('can waitFor stores before proceeding', ()=>{
    var d = new Dis();
    var s3 = d.register(0, () => { d.waitFor(s1, s2); return (s1.get() + s2.get()); });
    var s1 = d.register(0, x => x + 1);
    var s2 = d.register(0, x => x + 2);

    // [s3, s2, s1].map(d.register);
    d.dispatch('xyz');
    s1.get().should.eql(1);
    s2.get().should.eql(2);
    s3.get().should.eql(3);
  });

  it('can detect circular dependencies', (done)=>{
    var d = new Dis();
    var s1 = d.register({}, o => { d.waitFor(s2); return o; });
    var s2 = d.register({}, o => { d.waitFor(s1); return o; });
    try{
      d.dispatch('xyz');
    }
    catch(err){
      err.should.be.ok;
      done();
    }
  });

});


describe('act', () => {
  it(`can parse descriptor objects,
    and return 'action' functions at given paths,
    and have dev friendly representations`, done =>{
    var messages = 0;
    var $ = act(() => messages++, {
      one: '',
      two: '',
      three(...words) {
        words.should.eql(['what', 'say', 'you']);
        $.four(...words);
        messages.should.eql(4);
        done();
      },
      four: '',
      something: ''
    });
    $.one();
    $.two();

    debug($).should.eql([
      '~:one',
      '~:two',
      '~:three',
      '~:four',
      '~:something'
    ]);


    $.three('what', 'say', 'you');
  });

  it('if an action returns a promise, it will call .done when finished, as a node style response', done => {
    var d = new Dis();
    var $ = act(d.dispatch, {
      a: ()=> {
        var p = new Promise(resolve => {
          resolve(true);
        });
        return p;
      }
    });
    d.register({}, (o, action) => {
      switch(action){
        case $.a.done:
          done();
          return o;
        default: return o;
      }
    });
    $.a();
  });

  it('if an action is an async function, it will call .done when finished, as a node style response', done => {
    var d = new Dis();
    var $ = act(d.dispatch, {
      b: async function(){
        await timeout(100);
        return;
      }
    });
    d.register({}, (o, action) => {
      switch(action){
        case $.b.done:
          done();
          return o;
        default: return o;
      }
    });
    $.b();
  });
});

describe('record/replay', ()=> {
  it('can snapshot state at any point, and goto that point whenever');
  it('can record a session, and replay it');
  it('works with disto-hot');
});

