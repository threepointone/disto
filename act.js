var [BRA, KET, IDENT] = ['BRA', 'KET', 'IDENT'];

function last(arr){ return arr[arr.length -1] };

function parse(src, prefix){
	var tree = src.split('').reduce((tokens, char)=> {
		if(char==='{'){
			tokens.push({type: BRA});
		}
		if(char==='}'){
			tokens.push({type: KET});
		}
		if(/\s/.test(char)){
			if(tokens.identBuffer){
				tokens.push({type: IDENT, val: tokens.identBuffer.join('')});
				tokens.identBuffer= null;
			}
		}
		if(/[a-z0-9]/i.test(char)){
			tokens.identBuffer = tokens.identBuffer || [];
			tokens.identBuffer.push(char);
		}

		return tokens;
	}, [])
	.reduce((stack, token) => {
		switch(token.type){
			case BRA: 
				stack.push([]); 
				break;
			case KET: 
				if (stack.length===1) break; 
				let children = stack.pop(); 
				last(last(stack)).children = children; 
				break;
			case IDENT: 
				last(stack).push(token);
				break;
			default: break;
		}
		return stack;
	}, [])[0];

	return toObj(tree);

	function toObj(arr, path=[]) {
		return arr.reduce((o, node)=>
			Object.assign(o, {
				[node.val] : Object.assign(
					{toString: () => (prefix?[prefix]:[]).concat(path).concat(node.val).join(':')}, 
					node.children ? toObj(node.children, path.concat(node.val)) : {})}), {});
	}
}


module.exports = parse;

var src = `{
	search { done } { xyz }
	details { done } 
	select 
	backToList 
	some { nested { action1 action2 }}}`;

console.log(JSON.stringify(parse(src, 'app').some.nested.action1 + ''));