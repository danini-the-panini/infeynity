export class Particle {
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

export class Electron extends Particle {
  constructor() {
    super(-1);
  }
}

export class Positron extends Particle {
  constructor() {
    super(+1);
  }
}

export class Photon extends Particle {
  constructor() {
    super(0);
  }
}

export class Vertex {
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

export class OriginVertex extends Vertex {
  constructor(particle) {
    super(particle);
    this.origin = true;
  }
}

export class Diagram {
  constructor(inputs, outputs, virtuals, vertices) {
    this.inputs   = inputs;
    this.outputs  = outputs;
    this.virtuals = virtuals;
    this.vertices = vertices;

    this.incomingVertices = this.inputs.map(p => new OriginVertex(p));
    this.outgoingVertices = this.outputs.map(p => new OriginVertex(p));

    this.originVertices   = [...this.incomingVertices, ...this.outgoingVertices];

    this.allParticles     = [...this.inputs, ...this.outputs, ...this.virtuals];
    this.allVertices      = [...this.originVertices, ...this.vertices];
  }
}