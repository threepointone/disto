import p from './parser'

function space(n) {
  let str= ''
  for(let i = 0; i< n; i++) {
    str+=' '
  }
  return str
}
function toString(nodes, spaces = 0) {
  let a = []
  for(let t of nodes) {
    a = [ ...a, `${space(spaces)}${t.node}${t.props || t.tags ?
    ` (${[ ...propsToArr(t.props), ...tagsToArr(t.tags) ].join(' ')})` : ''}${t.fields ? ' {' : ''}` ]
    if(t.fields) {
      a = [ ...a, toString(t.fields, spaces + 2), `${space(spaces)}}` ]
    }
  }
  return a.join('\n')

}

function propsToArr(props = {}) {
  return Object.keys(props || {}).reduce((arr, key) =>
      arr.concat(key + '=' + JSON.stringify(props[key])), [])
}
function tagsToArr(tags = {}) {
  return Object.keys(tags || {}).reduce((arr, key) =>
      arr.concat(':' + key), [])
}

module.exports = {
  ...p,
  toString
}
