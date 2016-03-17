import { queryTo } from './ql'

class Router {
  constructor(env) {
    this.env = env
  }
  handlers = []
  readHandlers = {}
  mutateHandlers = {}
  read(key, fn) {
    if(this.readHandlers.hasOwnProperty(key)) {
      throw new Error('duplicate read handler on ' + key)
    }
    this.readHandlers[key] = fn
  }
  mutate(key, fn) {
    if(this.handlers.hasOwnProperty(key)) {
      throw new Error('duplicate read handler on ' + key)
    }
    this.mutateHandlers[key] = fn
  }
  async doRead(query) {
    let ast = queryTo(query)
    readHandlers(ast.key)
  }
  doMutate() {

  }
  subscribe(fn) {
    this.handlers.push(fn)
    return () => this.handlers = this.handlers.filter(f => f !== fn)
  }
}

export function makeRouter() {
  return new Router()
}
