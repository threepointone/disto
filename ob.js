// utitlities to convert to react style observables
export function toOb(store) {
  return {
    subscribe(opts) {
      opts = Object.assign({
        onNext: () => {}
      }, opts);

      var fn = () => opts.onNext(store());
      store.on('change', fn);
      // run it once to send initial value
      fn();
      return {
        dispose() {
          store.off('change', fn);
        }
      }
    }
  }
}

export function toObs(ko) {
  return Object.keys(ko).reduce((o, key) => Object.assign(o, {
    [key]: toOb(ko[key])
  }), {});
}