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
  // longer flow

  let read = (state, query, params) => {}
  let mutate = (state, action) => {}
  let remote = (query/action, merge) => {}

  let model = { read, mutate, data, remote }

  // initial read/render
  let state = model.read(view.query())
  render(view(state), element)

  function step(action){
    if(action.type === 'read'){
      state = merge(state, model.read(action.query || view.query()))
      // the above *might* trigger remote reads which might merge asynchronously
    }
    else if(action.type === 'mutate') {
      model.mutate(action)
      // as above, might trigger a remote mutation

      if(action.query){ // optional reads
        step({ type: 'read', query: action.query})
      }
    }
    render(view(state), element)
  }
  ```
  - `read` / `mutate` are pure!
  - in practice, you'd rarely trigger reads manually, mostly mutations. data fetching for free!
  - `view.query()` is a simple data structure, which can be optimized, serialized, etc
  - we can now use the view's `query` to hold a bunch of ui 'state' we'd have otherwise saved in the store
  - via relay - `view` can expect `state` to be in the shape of its `query`
  - can do incremental rendering based on what reads were asked, etc
