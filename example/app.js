var dispatcher = require('./dispatcher'),
	stores = require('./stores'),
	React = require('react'),
	mix = require('../mix'),
	{toObs} = require('../sto'),
	{Search} = require('./search-view');

window.React = React;
window.debug = require("debug");
window.debug.enable('example*');

var log = window.debug('example');


var App = React.createClass({
	mixins:[mix],
	observe(){
		return toObs(stores);
	},
	render() {
		var data = this.state.data;

		return (
			<div>
				<div>{JSON.stringify(data.debug.toJS(), null, ' ')}</div>
				<Search {...data} /> 
			</div>
			
		);
	}
});

React.render(<App/>, document.getElementById('container'));
