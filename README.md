disto
---

[here be dragons]

<img src='https://i.imgur.com/2sAntqf.jpg' alt='imitation/flattery'/>

steals ideas from a number of places
- om.next (most of the api is a lift)
- relay (optimistic updates, pagination*)
- falcor (ttl*)
- normalizr
- redux (mutations, infra, dan's hair cream)

features
---

- built on redux
- composabale queries
- generic graph data model
- 'precise' requests
- intelligent data normalization (via normalizr)
- optimistic updates
- remote sync
- sagas


query language
---
```jsx
let query = ql``
```

application(config)
---

creates a root 'app' that you can use to control the app

- `config`
  - `normalize` - `true` / `false`
  - `read(env, key, params)`
  - `reduce(state, action)`
  - `send(remotes, {merge, transact, optimistic})`
  - `store` : object / redux store
  - `mutate(env, action)`
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

etc
---

- hot loading
- streaming results
- server side rendering

- * ttl caching
- * pagination
- * 'precise' rendering

* - todo
