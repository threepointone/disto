/*global jest, describe, it, expect*/

jest.dontMock('../src.js');
require('chai').should();

import {Flux} from '../src';
import {TestUtils} from 'react/addons';

let render = ::TestUtils.renderIntoDocument;
let find = ::TestUtils.findRenderedDOMComponentWithTag;
let click = ::TestUtils.Simulate.click;


describe('Flux', () => {
  it('represents flux as a component', () => {
    console.log('heeay');
    let counter = (n, a) => a.type === 'inc' ? n + 1 : n,
      inc = () => ({type: 'inc'}),
      flux = <Flux stores={{counter}} actions={{inc}}>{
        (state, $) => <div onClick={$.inc}>{`${state.counter}`}</div>
      }</Flux>,
      rendered = render(flux),
      div = find(rendered, 'div');

console.log('heeay1');
    expect(div.getDOMNode().textContent).toEql('0');
console.log('heeay2');
    // Simulate a click and verify that the value changed
    click(div);
    console.log('heeay3');
    expect(div.getDOMNode().textContent).toEql('1');
    console.log('heeay4');
    click(div);
    console.log('heea5');
    expect(div.getDOMNode().textContent).toEql('2');
    console.log('heeay6');
  });
});
