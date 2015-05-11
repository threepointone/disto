/*global describe, it*/
// todo - tests for invariant conditions

require('chai').should();

import {Dis, act, debug} from '../index';

describe('sto', ()=>{
  it('initializes with seed value', ()=>{
    let dis = new Dis(),
      store = dis.register({x: 1, y: 2});
    store.get().should.eql({x: 1, y: 2});

  });

  it('responds to actions / returns current state', ()=>{
    let dis = new Dis(),
      s = dis.register({x: 1, y: 2},
      (o, action, key, val=1) => (action==='inc') ? Object.assign(o, {[key]: o[key] + val}) : o);
    dis.dispatch('inc', 'x', 5);
    s.get().x.should.eql(6);
  });

  it('can subscribe to changes', done => {
    let dis = new Dis(),
      s = dis.register({times: 0}, state => ({times: state.times+1}));
    let {dispose} = s.subscribe(()=> {
      if(s.get().times === 1){
        dispose();
        done();
      }
    });
    dis.dispatch('gogogo');
  });

  it('does not emit change when state hasn\'t changed', done => {
    let dis = new Dis(),
      s1 = dis.register(3, (num, action) => {
      if(action==='inc'){
        return num + 1;
      }
      return num;
    });

    var once = false;
    let {dispose} = s1.subscribe(()=> {
      if(once){
        done('should not fire');
      }
      else{
        once = true;
      }
    });
    dis.dispatch('xyz');
    dis.dispatch('xyz');
    dis.dispatch('xyz');
    dispose();
    done();
  });

  it('!!does not emit change when same object is mutated and returned!!!', done => {
    // this is by design!
    let dis = new Dis(),
      s1 = dis.register({x: 0}, state => Object.assign(state, {x: state.x+1}));

    var once = false;
    s1.subscribe(()=> {
      if(once){
        done('should not fire');
      }
      else{
        once = true;
      }

    });
    dis.dispatch('xyz');

    // so if you're using object.assign, make sure you start with a fresh object
    var s2 = dis.register({x: 0}, state => Object.assign({}, state, {x: state.x+1}));
    var once2 = false;
    s2.subscribe(()=> {
      if(once2){
        done(); // will fire
      }
      else{
        once2 = true;
      }
    });
    dis.dispatch('xyz');
  });

  it('however, you can use a custom equality check', done => {
    // be careful with this.
    function eql(){
      return false;
    }

    let dis = new Dis(),
      s = dis.register({x: 0}, (state) => Object.assign(state, {x: state.x+2}), eql);

    var once = false;
    s.subscribe((newS)=> {
      // ick, mutable shared object
      if(once){
        newS.x.should.eql(2);
        done(); // will fire
      }
      else{
        once = true;
      }
    });
    dis.dispatch('xyz');
  });


  it('is a react style observable', (done)=>{
    let dis = new Dis(),
      s = dis.register(0, x => x+1);

    var {dispose} = s.subscribe({onNext: state => (state===2) && done() });
    dis.dispatch('_');
    dis.dispatch('_');
    dispose();
  });
});

describe('Dis', ()=>{
  it('can register|unregister stores, and send messages to all registered stores', ()=>{
    var d = new Dis(),
      s = d.register(0, state => state+1);

    // d.register(s);

    d.dispatch('xyz'); d.dispatch('xyz'); d.dispatch('xyz');

    s.get().should.eql(3);
    d.unregister(s);

    d.dispatch('xyz'); d.dispatch('xyz'); d.dispatch('xyz');
    s.get().should.eql(3);
  });

  it('can waitFor stores before proceeding', ()=>{
    var d = new Dis();
    var s3 = d.register(0, () => {d.waitFor(s1, s2); return (s1.get() + s2.get()); });
    var s1 = d.register(0, x => x+1);
    var s2 = d.register(0, x => x+2);

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
    var $ = act((action, ...args)=> messages++, {
      one: '',
      'one.one': '',
      two: '',
      three(...words){
        words.should.eql(['what', 'say', 'you']);
        $.four(...words);
        messages.should.eql(5);
        done();
      },
      four: '',
      some: {nested: {thing: ''}}
    });
    $.one();
    $.two();
    $.one.one();

    debug($).should.eql([
      '~:one',
      '~:one.one',
      '~:two',
      '~:three',
      '~:four',
      '~:some',
      '~:some:nested',
      '~:some:nested:thing'
    ]);

    debug($.some).should.eql([
      '~:some:nested',
      '~:some:nested:thing'
    ]);

    ($.some.nested.toString()).should.eql('~:some:nested');

    $.three('what', 'say', 'you');
  });
});
