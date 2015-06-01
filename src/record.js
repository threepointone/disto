// snapshot / record / replay
// based on the the api from https://github.com/goatslacker/alt/blob/master/src/utils/DispatcherRecorder.js

// todo - match timestamps, to be more realistic?

const constants = {
  snapshot: 'DISTO_SNAPSHOT',
  goTo: 'DISTO_GOTO',
  record: 'DISTO_RECORD',
  stop: 'DISTO_STOP',
  play: 'DISTO_PLAY',
  playDone: 'DISTO_PLAY_DONE'
};

export const $ = {
  snapshot: function() {
    this.dispatch(constants.snapshot);
  },
  goTo: function(i) {
    this.dispatch(constants.goTo, i);
  },
  record: function() {
    this.dispatch(constants.record);
  },
  stop: function() {
    this.dispatch(constants.stop);
  },
  play: function() {
    var i = 0;
    var t = this;
    this.dispatch(constants.play);
    let intval = setInterval(function(){
      let [action, args] = t.recorderStore.get().actions[i];
      t.dispatch(action, ...args);
      i++;
      if(i === t.recorderStore.get().actions.length){
        clearInterval(intval);
        t.dispatch(constants.playDone);
      }
    }, 100);
  }
};



export const initial = {
  recording: false,
  playing: false,
  actions: []
};

export function reduce (o, action, ...args){
  switch(action){
    case constants.record:
      return {
        ...o,
        recording: true,
        actions: []
      };

    case constants.stop:
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
        actions: o.actions.concat([[action, args]])
      } : o;
  }
}

export function setup(dis, sto){
  dis.recorderStore = sto;
  var regi = dis.register; // slip by disto-hot :S
  dis.register = (init, red, comp) => {
    var state, snapshots = [];

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
          state = o;
          return o;

        case constants.play:
          return state;

        case constants.stop:
          return o;

        case constants.playDone:
          return o;
      }
    }
    return regi(init, function(o, action, ...args){
      return use(o, action, ...args) || red(o, action, ...args);
    }, comp);
  };
  Object.assign(dis, $);

}
