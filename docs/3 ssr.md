Server Side Rendering
---
For SEO and performance reasons, a common use case for web applications is to be fed some input, wait for it to finish updating, and then render in one shot. One can then 'prerender' an application for a given url, send the html, and then when the javascript loads back up, it 'takes over' the page and continues operating.

However, flux applications have 2 specific problems with this flow.

problem 1: multiple instances of the application run in the same thread, so can't organize stores / action creators in global/require memory space.

solution
---
```js
// instantiate a context for every app instance.  

// app .js 
	var app = {
	dispatcher: new Dispatcher()
}

// this context establishes a namespace of sorts for the app.

// using this context, create actions, action creators and stores, 

// creators.js
// action creators 
export function creators(app){
	let {dispatch} = app.dispatcher;
	return {
		search(query){
			dispatch('search');
			query('search', query)
				.then(res => dispatch('search.done', res))
				.catch(err => dispatch('search.error', err))
		}
	}
}

// stores.js
export function stores(app){
	let {waitFor} = app.dispatcher
	return {
		search: store({query: '', res:null, err: null}, (o, action, ...args){}),
		details: store({id: '', res:null, err: null}, (o, action, ...args){})
		// etc
	}	
}

// in your views, use the creators/store states from props/contexts passed to it

class Input extends React.Component {
	onChange(){
		this.props.actions.search.query(e.target.value)
	}
	render() {
		return <input 
			value={this.props.stores.search.query} 
			onChange={this.onChange} />
	}
};

// we can now pass in action creators and state at the top of the app, effectively sandboxing the app onto the context

```

problem 2: flux doesn't specifiy how to know when the entire UI has 'finished' updating, so you can render in one shot. Indeed, some flux apps are long running and never 'finish' rendering.

solution
---
This is a little trickier. Since the app doesn't have a strong notion of request/response, it has to be encoded into the app. A naive way is to track events fired by action creators, and track designated 'end' events. A better way is to have actions trigger callbacks when 'done'. Others include observables, etc. Examples are left as an exercise to the reader.


The good news is that some libraries can help you with this! (eg. [fluxible](https://github.com/yahoo/fluxible)).

The recommended approach would be build it in a hybrid manner - rendering only the bits of the page that are 'important', and then loading more components/functionality after it loads in the browser. 
