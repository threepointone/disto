var sto = require('../sto'),
	dispatcher = require('./dis'),
	{$} = require('./actions'),
	imm = require('immutable');

var list = sto(imm.Map({loading: false, query: '', results: [], selected: false}), 
	(state, action, ...args) => {
		switch(action){
			case $.search: 
				return state.merge({selected: false, loading: true, query, error: null});

			case $.search.done: 
				let {err, res} = args;
					return (err || res.error) ? 
			      state.merge({loading:false, results: [], error: err || res.error}) :
			      state.merge({loading:false, results: imm.fromJS(res.body.data.results.products), error: null});
			 
			case $.select: 
			 	return state.merge({selected: id});
			 
			case $.backToList
			 	return state.merge({selected: null});
			
			default: 
				return state;
		}
	});

dispatcher.register(list);


var details = sto({loading: false, query: '', results: [], selected: false}, 
	(state, action, ...args) => {
		switch(action){
			case $.details:
				return state.merge({loading: true, id, details:null, error: null});
			
			case $.details.done:
				let {err, res} = args;
				return (err || res.error) ? 
			      state.merge({loading:false, results: [], error: err || res.error}) :
			      state.merge({loading:false, results: imm.fromJS(res.body.data), error: null});

	}
});

dispatcher.register(details);


var dumbo = sto({}, (state, action) => { 
	dispatcher.waitfor(list, details);
	console.log('action', action+'');
	return {
		query: list().get('query'),
		id: details().get('id')
	};
});

dispatcher.register(dumbo);

module.exports = {list, details, dumbo};
