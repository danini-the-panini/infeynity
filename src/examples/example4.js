import { Electron, Positron, Photon, ElectronEmitVertex, ElectronAbsorbVertex, Diagram } from '../feynman';

const e1 = new Electron();
const e2 = new Electron();
const g1 = new Photon();
const g2 = new Photon();
const ev = new Electron();

const v1 = new ElectronEmitVertex(e1, g2, ev);
const v2 = new ElectronAbsorbVertex(ev, g1, e2);

const inputs = [e1, g1];
const outputs = [g2, e2];
const virtuals = [ev];
const vertices = [v1, v2];

export default new Diagram(inputs, outputs, virtuals, vertices);