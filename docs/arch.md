architectures and whatnot
---

1. plain ol' React

  ```jsx
  let state = initial
  render(view(state), element)
  ```
  - `view` is pure!
  - the above + `setState`/lifecycle methods/`props`/callbacks are good for simple web pages
  - problem - no real concept of `state` changing over time

2. flux

  ```jsx
  let state = initial
  let reduce = (state, action) => {}

  function step(action){
    // possible side effects //
    state = reduce(state, action)
    render(view(state), element)    
  }

  // then call `step` on every `action`
  ```
  - `reduce` is pure!
  - good for simple - intermediate apps
  - assumes state is in the shape that `view` wants
  - no real distinction between reads/writes on the store
  - it's up to the 'possible side effects' to 'decide' how to do remote syncs


3. relay / om.next / falcor

  the core idea is - `state = model.read(view.query())`

  ```jsx
  let read = (state, query, params) => {}
  let mutate = (state, mutation) => {}
  let remote = (query/mutation, merge) => {}

  let model = ({ read, mutate, data, remote })

  function step(mutation){  
    model.transact(mutation) // possible side effects, remote syncs
    let state = model.read(view.query()) // possible remote reads
    render(view(state), element)    
  }
  ```
  - `read` / `mutate` are pure!
  - in practice, you'd rarely trigger reads manually, mostly mutations. data fetching for free!
  - `view.query()` is a simple data structure, which can be optimized, serialized, etc  
  - we can now use the view's `query` to hold a bunch of ui 'state' we'd have otherwise saved in the store
  - via relay - `view` can expect `state` to be in the shape of its `query`
  - can do incremental rendering based on what reads were asked, etc


### pieces 

  query = [...expr] || ql`[shorthand]`

  mutation = { type, payload [, reads] }

  action = query | mutation

  read = ƒ(env, key, params) => {
    remote: true | falsy | name,
    value : {/* in desired shape */}
  }

  mutate = ƒ(env, mutation) => {
    remote: true | falsy | name,
    value: { keys: [k...], tempids: [] },
    effect: () => { /* side effect */ }
  }

  send = ƒ({ ...remotes }, merge)

  merge = ƒ(state => /* data to merge */)

  model = ƒ(read, mutate) =>
    ƒ(env, action, remote = false)

  reconciler = ƒ(parser, data, send)

    .add(Component, element)
    .remove()
    .merge(novelty)
    .transact(action, forceRemote)


  as a developer,
   - define `read`, `mutate`, `send`.
   - then set up your components and their query/variables/idents
   - finally, add `transact`/`setQuery`/`setVariables` calls for state changes
   - iterate :)
