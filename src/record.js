// snapshot / record / replay
// based on the the api from https://github.com/goatslacker/alt/blob/master/src/utils/DispatcherRecorder.js

const constants = {
  snapshot: 'DISTO_SNAPSHOT',
  goTo: 'DISTO_GOTO',
  record: 'DISTO_RECORD',
  stop: 'DISTO_STOP',
  play: 'DISTO_PLAY',
  playDone: 'DISTO_PLAY_DONE'
};

function timeout(t){
  return new Promise(resolve => setTimeout(resolve, t));
}

export function helpers (dis, store) {
  let {dispatch} = dis;
  let o = {
    snapshot: function() {
      dispatch(constants.snapshot);
    },
    goTo: function(i) {
      dispatch(constants.goTo, i);
    },
    record: function() {
      dispatch(constants.record);
    },
    stop: function() {
      dispatch(constants.stop);
    },
    play: async function() {
      if(store.get().recording) {
        o.stop();
      }
      let passed = 0;
      dispatch(constants.play);
      for (var [action, args, time] of store.get().actions){
        await timeout(Math.max(time - passed, 0));
        dispatch(action, ...args);
        passed = time;
      }
      o.playDone();
    },
    playDone: function() {
      dispatch(constants.playDone);
    }
  };

  return o;
}

export const initial = {
  start: -1,
  recording: false,
  playing: false,
  actions: []
};

export function reduce(o, action, ...args){
  switch(action){
    case constants.record:
      return {
        ...o,
        start: Date.now(),
        recording: true,
        actions: []
      };

    case constants.stop:
      console.log('replacing');
      return {...o,
        recording: false
      };

    case constants.play:
      return {...o,
        playing: true
      };

    case constants.playDone:
      console.log('done replaying');
      return {...o,
        playing: false
      };

    default:
      return o.recording ? {
        ...o,
        actions: o.actions.concat([[action, args, Date.now() - o.start]])
      } : o;
  }
}

export function setup(dis, m){
  let register = (m ? require('./hot').hot(dis, m) : dis).register;
  let sto = register(initial, reduce);
  // todo - replace with plugin api
  dis.register = (init, red, comp) => {
    var recordStartState, snapshots = [];

    function use(o, action, ...args){
      switch(action){
        case constants.snapshot:
          console.log(`snapshot ${snapshots.length}`);
          snapshots.push(o);
          return o;

        case constants.goTo:
          let [i] = args;
          if(!snapshots[i]){
            console.error(`snapshot ${i} not available`);
            return o;
          }
          return snapshots[i];

        case constants.record:
          recordStartState = o;
          return o;

        case constants.play:
          return recordStartState;

        case constants.stop:
          return o;

        case constants.playDone:
          return o;
      }
    }
    return register(init, function(o, action, ...args){
      return use(o, action, ...args) || red(o, action, ...args);
    }, comp);
  };

  return helpers(dis, sto);

}
