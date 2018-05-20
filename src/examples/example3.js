import { Electron, Positron, Photon, ElectronEmitVertex, PositronEmitVertex, ElectronAbsorbVertex, PositronAbsorbVertex, Diagram } from '../feynman';

const e1 = new Electron();
const e2 = new Electron();
const p1 = new Positron();
const p2 = new Positron();
const ev1 = new Electron();
const ev2 = new Electron();
const pv1 = new Positron();
const pv2 = new Positron();
const gv1 = new Photon();
const gv2 = new Photon();
const gv3 = new Photon();

const v1 = new ElectronEmitVertex(e1, ev1, gv1);
const v2 = new ElectronEmitVertex(ev1, ev2, gv2);
const v3 = new ElectronEmitVertex(ev2, e2, gv3);
const v4 = new PositronAbsorbVertex(p1, gv1, pv1);
const v5 = new PositronAbsorbVertex(pv1, gv2, pv2);
const v6 = new PositronAbsorbVertex(pv2, gv3, p2);

const inputs   = [e1, p1];
const outputs  = [e2, p2];
const virtuals = [ev1, ev2, pv1, pv2, gv1, gv2, gv3];
const vertices = [v1, v2, v3, v4, v5, v6];

export default new Diagram(inputs, outputs, virtuals, vertices);