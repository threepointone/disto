
import React from 'react';
import {Flux} from '../../src';
import {Spring} from 'react-motion';
import debounce from 'debounce';

// a complete yakshave

// redux provides a way to represent actions/reducers on a value
// disto exposes that as a component
// react-springs smoothes out movements to give average velocity
// all resulting in -

export class App {
  render(){
    return <Velocity>{
      (velocity, move) => <div style={{width: 200, height: 200}} onMouseMove={move}>
        speed is <br/>
        x: {velocity.x.val} <br/>
        y: {velocity.x.val} <br/>
        xy: {velocity.x.val}
      </div>
    }</Velocity>;
  }
}


const debounced = debounce(f => f(), 100),
  move = evt => dispatch => dispatch({evt, type: 'event'}) && debounced(() => dispatch({type: 'settle'})),
  tracker = (o = {x: 0, y: 0, velocity: { x: 0, y: 0, xy: 0}, timeStamp: Date.now()}, {type, evt}) => {
    if(type === 'event'){
      let deltaX = evt.pageX - o.x,
        deltaY = evt.pageY - o.y,
        dT = (evt.timeStamp - o.timeStamp),
        vXY = (dT === 0) ? 0 :
          Math.sqrt((deltaX * deltaX) + (deltaY * deltaY)) / dT,
        vX = (dT === 0) ? 0 : deltaX / dT,
        vY = (dT === 0) ? 0 : deltaY / dT;

      return { x: evt.pageX, y: evt.pageY, timeStamp: evt.timeStamp, velocity: { x: vX, y: vY, xy: vXY} };
    }
    if(type === 'settle'){
      return { ...o, velocity: {x: 0, y: 0, xy: 0}};
    }
    return o;
  };

export class Velocity{
  shouldComponentUpdate(){ return true; }
  render(){
    return <Flux stores={{tracker}} actions={{move}}>{
      ({tracker}, {move}) =>
        <Spring endValue={{velocity: {
          x: {val: tracker.velocity.x},
          y: {val: tracker.velocity.y},
          xy: {val: tracker.velocity.xy}} }}>{
            ({velocity}) => this.props.children(velocity, move)
        }</Spring>
    }</Flux>;
  }
}




// export function tracker(reducer) {
//   return (o, action) => {
//     let track = o.track || {x: 0, y: 0, velocity: 0, timeStamp: Date.now()};
//     switch(action.type){
//       case 'track-move':
//         let {x, y, ts} = action, deltaX = track.x - x, deltaY = track.y - y,
//           velocity = (ts === track.ts) ? 0 : Math.sqrt((deltaX * deltaX) + (deltaY * deltaY)) / (ts - track.ts);
//         return reducer({...o, track: {x, y, ts, velocity}}, action);

//       case 'track-move-stop':
//         return reducer({...o, track: {...o.track, velocity: 0}});
//       default: reducer(o.track === track ? o : {...o, track}, action);
//     }
//   };

// }