export function log(msg) {
  console.log(msg || this) // eslint-disable-line no-console
  return this
}

export function print() {
  return JSON.stringify(this, null, ' ')::log()
}
