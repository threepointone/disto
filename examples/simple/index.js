import 'babel/polyfill';
import React from 'react'; window.React = React;
import {$, counter, App} from './app.js';

React.render(<App/>, document.getElementById('root'));
