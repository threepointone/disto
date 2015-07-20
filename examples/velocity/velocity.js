import React from 'react';
import {Flux} from '../../src';
import {Spring} from 'react-motion';
import debounce from 'debounce';

const debounced = debounce(f => f(), 200),
  move = evt => dispatch => dispatch({evt, type: 'event'}) && debounced(() => dispatch({type: 'settle'})),
  tracker = (o = {x: 0, y: 0, velocity: 0, timeStamp: Date.now()}, {type, evt}) => {
    if(type === 'event'){
      let deltaX = o.x - evt.pageX,
        deltaY = o.y - evt.pageY,
        velocity = (evt.timeStamp === o.timeStamp) ? 0 :
          Math.sqrt((deltaX * deltaX) + (deltaY * deltaY)) / (evt.timeStamp - o.timeStamp);

      return { x: evt.pageX, y: evt.pageY, timeStamp: evt.timeStamp, velocity };
    }
    if(type === 'settle'){
      return { ...o, velocity: 0};
    }
    return o;
  };

export class Velocity{
  render(){
    return <Flux stores={{tracker}} actions={{move}}>{
      ({tracker}, {move}) =>
        <Spring endValue={{velocity: {val: tracker.velocity * 100} }}>{
          ({velocity}) => this.props.children(velocity.val, move)
        }</Spring>
    }</Flux>;
  }
}
