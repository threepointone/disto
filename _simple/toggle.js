import {dis, $} from './$';

export const toggle = dis.register({
  times: 0
}, (o, action) => {
  switch(action){
    case $.toggle:
      return {
        ...o,
        times: o.times + 1
      };
    default:
      return o;
  }
});

