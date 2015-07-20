// these don't work yet. node 0.12/iojs 2.3.4.

/*global jest, describe, it, expect*/

jest.dontMock('../src.js');
require('chai').should();

import {Flux} from '../src';
import {TestUtils} from 'react/addons';

let render = ::TestUtils.renderIntoDocument;
let find = ::TestUtils.findRenderedDOMComponentWithTag;
let click = ::TestUtils.Simulate.click;
let text = el => el.getDOMNode().textContent;

describe('Flux', () => {
  it('represents flux as a component', () => {
    console.log('heeay');
    let counter = (n, a) => a.type === 'inc' ? n + 1 : n,
      inc = () => ({type: 'inc'}),
      rendered = render(<Flux stores={{counter}} actions={{inc}}>{
        (state, $) => <div onClick={$.inc}>{`${state.counter}`}</div>
      }</Flux>),
      div = find(rendered, 'div');

    expect(text(div)).toEql('0');
    // Simulate a click and verify that the value changed
    click(div);
    expect(text(div)).toEql('1');
    click(div);
    expect(text(div)).toEql('2');
  });
});
