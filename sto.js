var {EventEmitter} = require('events');

export function sto(fn, initial){
	var state = initial;
	return EventEmitter(function(action, ...args){
		if(action){
			state = fn(state, action, ...args);
			this.emit('change', state);
		}
		return state;
	});
}


// utitlities to convert to react style observables
export function toOb(store){
	return {
		subscribe(opts){
			opts = Object.assign({
				onNext: ()=>{}
			}, opts);

			var fn = ()=> opts.onNext(store());
			store.on('change', fn);
			return {
				dispose(){
					store.off('change', fn);
				}
			}
		}
	}
}

export function toObs(o){
	return Object.keys(stores).reduce((o, key) => 
		Object.assign(o, {[key]: toOb(stores[key]) }));
}
