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
  static query = () => ql`[count]`
  onClick = () => this.props.transact({ type: 'tick' })
  render() {
    return <div onClick={this.onClick}>
      clicked { this.props.count } times
    </div>
  }
}

function read(env, key /*, params */) {
  return {
    value: env.get()[key]
  }
}

function mutate(env, action){
  if(action.type === 'tick'){
    return {
      effect: () => env.store.swap(({ count }) =>
        ({ count: count + 1 }))
    }
  }
}

application({ read, mutate }).add(App, window.app)
```

features
---

- built on redux
- composable queries
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

this is fairly similar to om.next's parser, except that mutations are actions. more on om.next's parser [here](https://github.com/omcljs/om/wiki/Quick-Start-(om.next)#parsing--query-expressions)

```jsx

function read(env, key){
  return {
    value: env.parser({store: env.get()[key]}, env.query)
  }
}

function mutate(env, action){
  if(action.type == 'increment'){
    return {
      value: {
        keys: ['count']
      },
      effect: () => env.store.swap(state =>
        ({ ...state, count: state.count + 1 }))
    }
  }
}
let parser = makeParser({ read, mutate })
parser({store}, ql`[ { user [name email] } ]`)

// {
//   user : {
//     name: 'Slash',
//     email: 'slash@gnr.com'
//   }
// }

store.get().count::log()
// 0
parser({store}, { type: 'increment' })
store.get().count::log()
// 1

```


application(config)
---

creates a root 'app' that you can use to control the app

- `config`
  - `normalize` - `true` (default) / `false`
  - `read(env, key, params)`
  - `mutate(env, action)`
  - `send(remotes, cb)`
  - `store` : object / redux store
  - `reduce(state, action)` * optional
  - `middleware` * optional
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
- `merge(state)`
- `optimistic(action, query, remote = false)`
- `makeRef(key)` - use with `refer={}` to make references to be used with `subquery` etc


functions
---
- `treeToDb(query, state, merge = true)`
- `dbToTree(query, state, appState)`
- `makeParser({ read, mutate })`
- `astToExpr(ast)` - `ast->expr`
- `exprToAst(expr)` - `expr->ast`
- `queryToAst(query)` - `query->ast`
- `meta(o, key) / withMeta(o, m)`
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
- incremental rendering (todo)

