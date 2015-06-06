import {Dis, hot, record, mix} from '../../src';

export const dis = new Dis();

const r = record.setup(dis, module),
  {register, act} = hot(dis, module);

window.r = r;

