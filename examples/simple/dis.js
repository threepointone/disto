import {Dis, record} from '../../src';

let dis = new Dis();
export default Object.assign(dis, {dev: record.setup(dis, module)});

window.r = dis.dev;
