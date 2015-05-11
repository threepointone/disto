// get some dependencies
import 'babelify/polyfill'; // for some es6 goodness
import React from 'react';
import imm from 'immutable';

function times(n, fn){
  var arr = [];
  for(var i = 0; i < n; i++){
    arr.push(fn(i));
  }
  return arr;
}

// pull out the magic 4
import {
  Dis,    // dispatcher class
  toObs,  // create observables from a keyed collection of stores
  act
} from '../take2';

// import mix from '../mix'; // mixin for .observe()

// make a new dispatcher
const dis = new Dis(),
  {dispatch, register, waitFor} = dis;

const $ = act(dispatch, {
  init: '',
  // chooseLetter: '',
  paint: '' // a single character
  // goTo: '', // goes to a particular snapshot
  // play: '' // replay actions forward

});

const canvas = register(imm.fromJS({
  letter: 'x',
  pixels: times(50, () => times(50, () => 'x'))
}), (o, action, ...args) => {
  switch(action){
    case $.paint:
      let [x, y] = args;
      return o.updateIn(['pixels', x, y], () => o.get('letter'));
    default: return o;
  }

});

const timeline = register(imm.fromJS({
  // index: 0, // current position
  events: []   // differentiate between action, snapshot
}), (o, action, ...args) => {
  switch(action){
    case $.paint:
      // waitFor(canvas);
      // modify events timeline
      return o.updateIn('events', arr => arr.push([action, ...args]));

    default: return o;
  }
});





export const App = React.createClass({
  observe(){
    return toObs({canvas, timeline});
  },
  render() {
    return <Graffiti {...this.state.data} />;
  }
});



export const Graffiti = React.createClass({
  render() {
    return (
      <div>
        <Canvas {...this.props.canvas}/>
        <Timeline {...this.props.timeline}/>
      </div>
    );
  }
});

export const Canvas = React.createClass({
  render() {
    const {canvas} = this.props;
    return (
      <div>
        {canvas.map(row =>
          <div>
            {row.map(char =>
              <div>
                {char}
              </div>
            )}
          </div>)}
      </div>
    );
  }
});


export const Timeline = React.createClass({
  render() {
    let {timeline} = this.props;
    return (
      <div>
        {timeline.map(event => {
          let [action, ...args] = event;
          return <div> {action} </div>;
        })}
      </div>
    );
  }
});

