import { Electron, Positron, Photon, ElectronEmitVertex, ElectronAbsorbVertex, Diagram } from '../feynman';

const e1 = new Electron();
const e2 = new Electron();
const e3 = new Electron();
const e4 = new Electron();
const gv = new Photon();

const v1 = new ElectronAbsorbVertex(e1, e3, gv);
const v2 = new ElectronEmitVertex(e2, e4, gv);

const inputs   = [e1, e2];
const outputs  = [e3, e4];
const virtuals = [gv];
const vertices = [v1, v2];

export default new Diagram(inputs, outputs, virtuals, vertices);
