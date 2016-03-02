import p, { parse as ƒ } from './parser'


function space(n) {
  let str= ''
  for(let i = 0; i< n; i++) {
    str+=' '
  }
  return str
}

function propsToArr(props = {}) {
  return Object.keys(props || {}).reduce((arr, key) =>
      arr.concat(key + '=' + JSON.stringify(props[key])), [])
}
function tagsToArr(tags = {}) {
  return Object.keys(tags || {}).reduce((arr, key) =>
      arr.concat(':' + key), [])
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


function randomStr() {
  let s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", N = 16
  return Array(N).join().split(',').map(() =>  s.charAt(Math.floor(Math.random() * s.length)) ).join('')
}


function walk(field, map = {}, path = []) {
  if(field.fields) {
    return field.fields.reduce((arr, f) => {
      if(map[f.node]) {
        return [ ...arr, [ [ ...path, field.node ], map[f.node] ] ]
      }
      else {
        return [ ...arr, ...walk(f, map, [ ...path, field.node ]) || [] ]
      }

    // multiple matches? union queries? valuesOf?
    }, [])
  }

}


export function substitute(strings, ...values) {
  let s = new Map(), o = {}
  values.forEach(x => {
    let r = randomStr()
    s.set(x, r)
    o[r] = x
  })
  let substitue_query = ƒ(strings.map((str, i) => str + (s.get(values[i]) || '')).join(''))
  let r = []
  substitue_query.forEach(q => {
    r = [ ...r, ...walk(q, o, undefined, r) || [] ]
  })


  return {

    edges: r,
    pieces: { strings, values }
  }

  // if array, then passed ident
}


module.exports = {
  ...p,
  toString
}

// [
//   'foo',  // keys
//   '[foo 0]',  // links
//   'foo { bar baz }', // joins
//   '[foo 0] { bar }',
//   'foo (bar=1)',
//   'foo (woz=?json) { bar baz }', // parameterized queries
//   `[foo 0] (woz=${value}) { bar ${getQuery(Component)} }`,
//   'do/it! (woz=1) { optional reads }', // parameterized mutations
//   'do/it!'
// ]

// foo (params) [ id title [ide nt] ]
// foo (params) User
// foo (params) {photo: Photo post: [id title]} // ?

// // especial case for subselection
// [ide, nt] (params)[ id title etc ]

// [app _]

// expr = node('foo').params(params).query([...exprs])

// strToExpr = ƒ
// interpolatedToExpr = ƒ



// items { {photo: Photo}}


