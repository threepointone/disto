export const cache = new WeakMap()

export function meta(o, k) {
  if(typeof o === 'symbol' || typeof o === 'string' || typeof o === 'number') {
    return
  }
  if(!cache.has(o)) {
    cache.set(o, {})
  }
  return cache.get(o)[k]
}

export function withMeta(o, m) {
  // only for objects!
  let newObj = Array.isArray(o) ? [ ...o ] : { ...o } // sets, maps?
  cache.set(newObj, m)
  return newObj
}
