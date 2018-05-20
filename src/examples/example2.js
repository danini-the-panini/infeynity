import { Electron, Positron, Photon, Vertex, OriginVertex } from '../feynman';

const e1 = new Electron();
const e2 = new Electron();
const e3 = new Electron();
const e4 = new Electron();
const gv = new Photon();

const v1 = new Vertex(e1, e2, gv);
const v2 = new Vertex(e3, e4, gv);

export const inputs = [e1, e3];
export const outputs = [e2, e4];
export const virtuals = [gv];

export const incomingVertices = inputs.map(p => new OriginVertex(p));
export const outgoingVertices = outputs.map(p => new OriginVertex(p));
export const innerVertices = [v1, v2];

export const originVertices = [...incomingVertices, ...outgoingVertices];

export const allParticles = [...inputs, ...outputs, ...virtuals];
export const allVertices = [...originVertices, ...innerVertices];
