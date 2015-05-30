// NOT WORKING, need to fix actions

// get some dependencies

import React from 'react'; window.React = React;
import {$} from './$';

// disto
import mix from '../src/mix';


import {tick} from './tick';
import {toggle} from './toggle';

// views
export const App = React.createClass({
  mixins: [mix],
  getDefaultProps() {
    return { tick, toggle };
  },
  observe(props){
    return props;
  },
  render() {
    var data = this.state.data;
    return (
      <div className="App">
        <div>time: {data.tick.soFar} </div>
        <button onClick={$.toggle}/>
        <div>clicks: {data.toggle.times} </div>
        <div>{data.tick.x || 'nothing'}</div>
      </div>
    );
  }
});


React.render(<App/>, document.getElementById('container'));
