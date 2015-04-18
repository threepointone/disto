"use strict";
// https://gist.github.com/threepointone/57ec4e29e2770e67c24b
let [BRA, KET, IDENT] = ['BRA', 'KET', 'IDENT'];

function last(arr) {
  return arr[arr.length - 1]
}

export default function parse(src, prefix) {
  let tree = src.split('').reduce((tokens, char) => {
      if (char === '{' || char === '}' || /\s/.test(char)) {
        if (tokens.identBuffer) {
          tokens.push({
            type: IDENT,
            val: tokens.identBuffer.join('')
          });
          tokens.identBuffer = null;
        }
      }
      if (char === '{') {
        tokens.push({
          type: BRA
        });
      }
      if (char === '}') {
        tokens.push({
          type: KET
        });
      }
      if (/[a-z0-9]/i.test(char)) {
        tokens.identBuffer = tokens.identBuffer || [];
        tokens.identBuffer.push(char);
      }
      return tokens;
    }, [])
    .reduce((stack, token) => {
      switch (token.type) {
        case BRA:
          stack.push([]);
          break;
        case KET:
          if (stack.length === 1) break;
          let children = stack.pop();
          last(last(stack)).children = children;
          break;
        case IDENT:
          last(stack).push(token);
          break;
        default:
          break;
      }
      return stack;
    }, [])[0];

  return toObj(tree);

  function toObj(arr, path = []) {
    return arr.reduce((o, node) =>
      Object.assign(o, {
        [node.val]: Object.assign({
            toString: () => (prefix ? [prefix] : []).concat(path).concat(node.val).join(':')
          },
          node.children ? toObj(node.children, path.concat(node.val)) : {})
      }), {});
  }
}