export default function reducer(fn) {
  return function (state = fn(undefined, '@@disto/probe'), action) {
    return fn(state, action)
  }
}
