import {$, dis} from './$';

// stores
export const tick = __couch__(dis.register)({
  soFar: 0,
  ticks: 0,
  start: Date.now()
}, (o, action) => {
  switch(action){
    case $.tick:
      return {
        ...o,
        soFar: (Date.now() - o.start),
        ticks: o.ticks + 1,
        x: 456
      };
    default:
      return o;
  }
});



