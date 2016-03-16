query language
---

### query

A `query` is an array of expressions

```jsx
let q = [ 'foo', [ 'bar', 2 ], new Map([ [ 'baz', [ 'prop1', 'prop2', 'prop3' ] ])]
// or use the helper for shorthand
let q = ql`[ foo [ bar 2 ] { baz [ prop1 prop2 prop3 ] } ]`
```

there are 5 types of expressions

### prop


a string denoting a 'prop'/ 'key'

```jsx
let expr = 'foo'
// or
let query = ql`[ foo ]`

read({ foo: 123, bar: 'abc' }, query)
// { foo: 123 }
```

### join
a `Map` with a single pair that denotes a join from one `expression` to another `query`

```jsx
let expr = new Map([ [ 'foo', [ 'id', 'title' ] ] ])
// or use the shorthand
let query = ql`[ { foo [ id title expr ] } ]`

read({foo: [ { id: 0, title: 'the killing joke', rating: 5 }, { id: 1, title: 'hush', rating: 4 }, /* ... */ ] }, query)
// { foo: [ { id: 0, title: '...' }, { id: 1, title: '...' } ] }

```

### union

joins can be on heterogenous lists, so our joins might be predicated on types. A union is thus like a join; a `Map` with a single pair that denotes a join from an `expression` to an object `{ type > query }*`. simpler to explain with an example -

```jsx
let expr = new Map([ [ 'items', {
  photo: [ 'id', 'title', 'image' ],
  graphic: [ 'id', 'image', 'caption' ]
}]])

// or with shorthand
let query = ql`[ { items {
  photo [ id title image ]
  post [ id title text ]
  graphic [ id image caption ]
}}]`

```

### parameterized expression
a `Set` with 2 elements; an `expression`, and associated `params` object

```jsx
let expr = new Set([ 'foo', { p1: 5, p2: 'abc' } ])
// much simpler with shorthand
let expr = ql`[ ( foo { p1 5 p2 "abc" } ) ]`

```

### idents / 'links'
a two element array `[ entity, id ]` for referencing an entity in your 'db'

```jsx
let expr = [ 'byname', 'mary' ]
// or
let query = ql`[ [ byname "mary" ] ]`

// like om.next, you can use '_' to not use an id when doing the lookup
let query = ql`[ [ currentUser _ ] ]`
```



nb
---
this tries to follow om.next's semantics, but we make do with javascript's data structures. as such, we use strings as a replacement for keywords, Sets to associate expressions with parameters, arrays for vectors, and Maps/objects for cljs Maps as appropriate
