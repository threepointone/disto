export default function reducer(fn) {
  return function (state = {}, action) {
    return fn(state, action)
  }
}
