import {$, dis} from './$';

// stores
export const tick = dis.register({
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
        x: 123
      };
    default:
      return o;
  }
});



