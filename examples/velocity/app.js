// a complete yakshave

// redux provides a way to represent actions/reducers on a value
// disto exposes that as a component
// react-springs smoothes out movements to give average velocity
// all resulting in -

import React from 'react';
import {Flux} from '../../src';
import {Spring} from 'react-motion';
import debounce from 'debounce';

const debounced = debounce(f => f(), 100),
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

class Velocity{
  render(){
    return <Flux stores={{tracker}} actions={{move}}>{
      ({tracker}, {move}) =>
        <Spring endValue={{velocity: {val: tracker.velocity * 100} }}>{
          ({velocity}) => this.props.children(velocity.val, move)
        }</Spring>
    }</Flux>;
  }
}


export class App {
  render(){
    return <Velocity>{
      (velocity, move) => <div style={{width: 200, height: 200}} onMouseMove={move}>
        speed is {Math.round(velocity)}
      </div>
    }</Velocity>;
  }
}
