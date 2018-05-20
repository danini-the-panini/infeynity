import { Electron, Positron, Photon, ProductionVertex, AnnihilationVertex, Diagram } from '../feynman';

const e1 = new Electron();
const e2 = new Electron();
const p1 = new Positron();
const p2 = new Positron();
const gv = new Photon();

const v1 = new AnnihilationVertex(e1, p1, gv);
const v2 = new ProductionVertex(gv, e2, p2);

const inputs = [e1, p1];
const outputs = [e2, p2];
const virtuals = [gv];
const vertices = [v1, v2];

export default new Diagram(inputs, outputs, virtuals, vertices);