class Router {
  constructor(){

  }
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
  doRead(query) {

  }
  doMutate() {

  }
}

export function makeRouter() {
  return new Router()
}
