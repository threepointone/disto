import {Dis, act} from '../src/index';
import {go, timeout, alts, putAsync, chan} from '../js-csp/csp';

export let dis = new Dis();
// make a new dispatcher
let {dispatch} = dis;


// actions
export const $ = act(dispatch, {
  tick: '',
  toggle: () => {
    var c = chan();
    go(function*(){
      yield c;
      while(true){
        $.tick();
        if((yield alts([timeout(0), c])).channel === c){
          yield c; // block unti it toggles again
        }
      }
    });
    return () => putAsync(c, true);
  }()
});


// module.hot.dispose(()=> dis = null);
