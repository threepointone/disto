disto
---

[highly experimental, be warned]

<img src='https://i.imgur.com/2sAntqf.jpg' alt='imitation/flattery'/>

steals ideas from a number of places
- om.next (most of the api is a lift)
- relay (colocation, optimistic updates, pagination)
- falcor (ttl, normalization)
- redux (mutations, infra, dan's hair cream)

show me what it looks like!

```jsx
@disto()
class App extends Component {
  static query = () => ql`[counter]`
  onClick = () => this.props.transact({ type: 'tick' })
  render() {
    return <div onClick={this.onClick}>
      clicked { this.props.counter } times
    </div>
  }
}

function read(env, key /*, params */) {
  return {
    value: env.get()[key]
  }
}

function reduce(state = { counter: 0 }, { type }) {
  if(type === 'tick') {
    return { counter : state.counter + 1 }
  }
  return state
}

application({ read, reduce }).add(App, window.app)
```

features
---

- built on redux
- composabale queries
- generic graph data model
- 'precise' requests
- intelligent data normalization (via normalizr)
- mutations via actions
- optimistic updates
- remote sync
- sagas


query language
---

rips off om.next/datomic pull syntax to give a generic query language on our 'model'

- as data structures

```jsx
let query = [
  'foo',
  new Map([['posts', ['id', 'title', Symbol.for('var')]]]),
  ['currentUser', '_'],
  new Map([['items', {photo: ['id', 'image'], post: getQuery(Post)}]]),
  // ...
]
```

- or with tagged template literals

```jsx
let query = ql`[
  foo
  { posts [id title ?var] }
  [currentUser _]
  { items { photo [id image] post ${getQuery(Post)} } }
]`
```

- variable substitution
- interpolation

more info [here](https://github.com/threepointone/disto/blob/graffo/docs/query-language.md)

parser
---

this is fairly similar to om.next's parser, except that mutations are actions, and we use a `reduce` reducer to accept state changes. more on om.next's parser [here](https://github.com/omcljs/om/wiki/Quick-Start-(om.next)#parsing--query-expressions)

application(config)
---

creates a root 'app' that you can use to control the app

- `config`
  - `normalize` - `true` (default) / `false`
  - `read(env, key, params)`
  - `mutate(env, action)`
  - `reduce(state, action)`
  - `send(remotes, {merge, transact, optimistic})`
  - `store` : object / redux store
  - `middleware`
- `.add(Component, element)`
- `.remove()`
- `.run(*saga)`
- `.read(query, remote = false)`
- `.transact(action, query, remote = false)`

@disto()
---

a decorator for components

```jsx
@disto()
class App extends React.Component {
  // optional statics
  static ident = () => ['app', '_']
  static variables = () => ({ start: 0, rows: 10 })
  static query = () => ql`[
    (items {start ?start rows ?rows })
    {user [name email]}
  ]`
  render() {
    let {items, user} = this.props
    // ...
  }
}
```

props passed in -

- `...value`
- `state`
- `query`
- `variables`
- `ident`
- `setState(state)` - sets 'local' state
- `setQuery(query, vars)/setVariables(vars)` - update the query/variables for the component
- `transact(action, query, remote = false)`
- `optimistic(action, query, remote = false)`
- `makeRef(key)` - use with `refer={}` to make references to be used with `subquery` etc


functions
---
- `treeToDb`
- `dbToTree`
- `makeParser({ read, mutate })`
- `astTo(ast)` - `ast->expr`
- `exprTo(expr)` - `expr->ast`
- `queryTo(query)` - `query->ast`
- `meta(o, k)/withMeta(o, m)`
- `bindVariables(query, variables)`
- `getQuery(Component)`
- `subquery(component, ref, klass)`

etc
---

- hot loading
- streaming results
- server side rendering
- ttl caching (todo)
- pagination (todo)
- 'precise' rendering (todo)

