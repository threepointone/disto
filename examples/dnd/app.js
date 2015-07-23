import React from 'react';
import {Flux} from '../../src';

import {Spring} from 'react-motion';
import {Springs} from 'react-springs';

import {Velocity} from '../velocity/app';



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

function offset(evt, {x, y}){
  return [evt.pageX - x, evt.pageY - y];
}

function displacement(u, a=-0.002){
  return (-1 * u * u / (2 * a)) * Math.sign(u);
}

const styles = {
  box: {
    position: 'absolute',
    backgroundColor: '#ccc',
    width: 100,
    height: 100,
    alignItems: 'center'
  }
};


export class App extends React.Component{
  state = {
    dragging: false,
    offset: [0, 0],
    x: 0,
    y: 0
  }
  onMouseDown = e => {
    let off = offset(e, this.state);
    this.setState({
      dragging: true,
      x: e.pageX - off[0],
      y: e.pageY - off[1],
      offset: off
    });
  }
  onMouseUp = (e, v) => {
    let sX = displacement(v.x.val);
    let sY = displacement(v.y.val);
    this.setState({
      dragging: false,
      x: this.state.x + sX,
      y: this.state.y + sY
    });
  }
  onMouseMove = (e, move) => {
    if(this.state.dragging){
      move(e);
      this.setState({x: e.pageX - this.state.offset[0], y: e.pageY - this.state.offset[1]});
    }
  }
  render() {
    return <Velocity>{
      (velocity, move) =>
        <Springs to={{top: this.state.y, left: this.state.x}}>{
        /* <Spring endValue={{top: this.state.y, left: this.state.x}}>{
          - Cheng, why wouldn't this^ work? It doesn't render with new values. works fine with react-springs */
          values =>
            (<div style={{width: '100%', height: '100%'}}
                          onMouseDown={this.onMouseDown}
                          onMouseUp={e => this.onMouseUp(e, velocity)}
                          onMouseMove={e => this.onMouseMove(e, move)}>
                            <div style={{...values, ...styles.box}}>
                              velocities: <br/>
                              x: {Math.round(velocity.x.val * 100)} <br/>
                              y: {Math.round(velocity.y.val * 100)} <br/>
                              xy: {Math.round(velocity.y.val * 100)}
                            </div>
                        </div>)
        }</Springs>
        /* </Spring>*/
    }</Velocity>;
  }
}



