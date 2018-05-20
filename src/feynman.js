class Particle {
  constructor(charge) {
    this.charge = charge;
    this.neighbours = [];
    this.vertices   = [];
  }

  addNeighbour(particle) {
    if (particle === this) return;
    if (this.neighbours.includes(particle)) return;
    this.neighbours.push(particle);
  }

  addVertex(vertex) {
    if (this.vertices.includes(vertex)) return;
    if (this.vertices.length === 2) throw new Error("Particle cannot have more than 2 vertices");
    this.vertices.push(vertex);
    vertex.particles.forEach(otherParticle => {
      this.addNeighbour(otherParticle);
    });
  }
}

class Electron extends Particle {
  constructor() {
    super(-1);
  }
}

class Positron extends Particle {
  constructor() {
    super(+1);
  }
}

class Photon extends Particle {
  constructor() {
    super(0);
  }
}

class Vertex {
  constructor(...particles) {
    this.particles = particles;
    this.particles.forEach(particle => {
      particle.addVertex(this);
    });
  }

  get neighbours() {
    return this.particles.reduce((a, b) => {
      return [...a, ...b.vertices.filter(v => !a.includes(v) && v !== this)];
    }, []);
  }

  particleOfNeighbour(vertex) {
    return this.particles.find(p => p.vertices.includes(vertex));
  }
}

class OriginVertex extends Vertex {
  constructor(particle) {
    super(particle);
    this.origin = true;
  }
}

const e1  = new Electron();
const e2  = new Electron();
const p1  = new Positron();
const p2  = new Positron();
const ev1 = new Electron();
const pv1 = new Positron();
const gv1 = new Photon();
const gv2 = new Photon();

const v1 = new Vertex(e1,  ev1, gv1);
const v2 = new Vertex(ev1, e2,  gv2);
const v3 = new Vertex(p1,  gv1, pv1);
const v4 = new Vertex(pv1, gv2, p2);

const ov1 = new OriginVertex(e1);
const ov2 = new OriginVertex(e2);
const ov3 = new OriginVertex(p1);
const ov4 = new OriginVertex(p2);

export const inputs           = [e1, p1];
export const outputs          = [e2, p2];
export const virtuals         = [ev1, pv1, gv1, gv2];

export const incomingVertices = [ov1, ov3];
export const outgoingVertices = [ov2, ov4];

export const originVertices   = [...incomingVertices, ...outgoingVertices];
export const innerVertices    = [v1, v2, v3, v4];

export const allParticles     = [...inputs, ...outputs, ...virtuals];
export const allVertices      = [...originVertices, ...innerVertices];
