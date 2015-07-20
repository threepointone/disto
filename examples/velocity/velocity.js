import React from 'react';
import {Flux} from '../../src';

import {Spring} from 'react-motion';

import SyntheticMouseEvent from 'react/lib/SyntheticMouseEvent';

import debounce from 'debounce';

let stores = {
  tracker(o = {x: 0, y:0, velocity: 0, timeStamp: Date.now()}, action) {

    if(action.type === 'event'){
      let evt = action.evt,
        deltaX = o.x - evt.pageX,
        deltaY = o.y - evt.pageY,
        velocity = (evt.timeStamp === o.timeStamp) ? 0 :
          Math.sqrt((deltaX*deltaX) + (deltaY*deltaY)) / (evt.timeStamp - o.timeStamp)

      return { x: evt.pageX, y: evt.pageY, timeStamp: evt.timeStamp, velocity };
    }
    if(action.type==='settle'){
      return { ...o, velocity: 0};
    }
    return o;
  }
}

let debounced = debounce(f => f(), 200);

let actions = {
  move: evt => dispatch => {
    dispatch({evt, type: 'event'})
    debounced(() => dispatch({type: 'settle'}));
  }
}

export class Velocity{
  render(){
    return <Flux stores={stores} actions={actions}>{
      ({tracker}, $) =>
        <Spring endValue={{velocity:{val: tracker.velocity*1000} }}>{
          ({velocity}) => this.props.children(velocity.val, $.move)
        }</Spring>
    }</Flux>;
  }
}
