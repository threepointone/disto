// this ones for stores
var {fn dispatch} = require('./dis'),
act = require('../act');

var $ = module.exports.$ = act(`{
	search { done } 
	details { done } 
	select 
	backToList 
	some { nested { action1, action2 }}}`);


// and this one's for the views to call
module.exports.$$ = {
	// search for a string
 	search(query){
 		dispatch($.search, query);
 		services.search(query, (...args) => dispatch($.search.done, ...args))
 	},

 	select(id): fn($.select),

 	details(id){
 		dispatch($.details, query);
 		services.details(id, (...args) => dispatch($.details.done, ...args))
 	},

 	backToList: fn($.backToList)
 }