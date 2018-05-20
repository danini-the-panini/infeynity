import { Electron, Positron, Photon, Vertex, OriginVertex } from '../feynman';

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

const v1 = new Vertex(e1, ev1, gv1);
const v2 = new Vertex(ev1, ev2, gv2);
const v3 = new Vertex(ev2, e2, gv3);
const v4 = new Vertex(p1, gv1, pv1);
const v5 = new Vertex(pv1, gv2, pv2);
const v6 = new Vertex(pv2, gv3, p2);

export const inputs = [e1, p1];
export const outputs = [e2, p2];
export const virtuals = [ev1, ev2, pv1, pv2, gv1, gv2, gv3];

export const incomingVertices = inputs.map(p => new OriginVertex(p));
export const outgoingVertices = outputs.map(p => new OriginVertex(p));
export const innerVertices = [v1, v2, v3, v4, v5, v6];

export const originVertices = [...incomingVertices, ...outgoingVertices];

export const allParticles = [...inputs, ...outputs, ...virtuals];
export const allVertices = [...originVertices, ...innerVertices];
