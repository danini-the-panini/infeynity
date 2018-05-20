function part([a, b], predicate) {
  if (predicate(b)) return [b, a];
  if (predicate(a)) return [a, b];
  return Math.random() > 0.5 ? [a, b] : [b, a];
}

export class Particle {
  constructor(charge, isFermion) {
    this.charge       = charge;
    this.isFermion    = isFermion;
    this.neighbours   = [];
    this.sources      = [];
    this.destinations = [];
    this.fromVertex   = null;
    this.toVertex     = null;
  }

  set from(v) {
    if (this.fromVertex) throw new Error(`${this.constructor.name} already has a "from" vertex`);
    this.fromVertex = v;
    this.addVertex(v, this.sources);
  }

  set to(v) {
    if (this.toVertex) throw new Error(`${this.constructor.name} already has a "to" vertex`);
    this.toVertex = v;
    this.addVertex(v, this.destinations);
  }

  get vertices() {
    return [this.fromVertex, this.toVertex];
  }

  addNeighbour(particle, sourceOrDestination) {
    if (particle === this) return;
    if (this.neighbours.includes(particle)) return;
    this.neighbours.push(particle);
    sourceOrDestination.push(particle);
  }

  addVertex(vertex, sourceOrDestination) {
    vertex.particles.forEach(otherParticle => {
      this.addNeighbour(otherParticle, sourceOrDestination);
    });

    if (vertex.origin) {
      if (this.onShell) throw new Error("Particle cannot be both incoming and outgoing");
      this.onShell = true;
      this.incoming = vertex.incoming;
    }
  }
}

export class Fermion extends Particle {
  constructor(charge) {
    super(charge, true)
  }
}

export class Electron extends Fermion {
  constructor() {
    super(-1);
  }
}

export class Positron extends Fermion {
  constructor() {
    super(+1);
  }
}

export class Photon extends Particle {
  constructor() {
    super(0, false);
  }
}

export class Vertex {
  constructor(...particles) {
    this.particles = particles;

    this.fermions = this.particles.filter(p => p.isFermion);
    this.bosons = this.particles.filter(p => !p.isFermion);
  }

  get neighbours() {
    return this.particles.reduce((a, b) => {
      return [...a, ...b.vertices.filter(v => !a.includes(v) && v !== this)];
    }, []);
  }

  particleOfNeighbour(vertex) {
    if (vertex === this) return null;
    return this.particles.find(p => p.vertices.includes(vertex));
  }
}

// interaction points
class InnerVertex extends Vertex {
  constructor(...particles) {
    super(...particles);

    if (this.bosons.length !== 1) throw new Error(`Inner Vertices must have exactly 1 boson, found ${this.bosons.length}`);
    if (this.fermions.length !== 2) throw new Error(`Inner Vertices must have exactly 2 fermions, found ${this.fermions.length}`);

    this.boson = this.bosons[0];
  }

  assertOppositeCharge() {
    const [f1, f2] = this.fermions;
    if (f1.charge !== -f2.charge) throw new Error('vertices must have fermions of opposite charge');
  }

  assertAllElectrons() {
    if (this.fermions.find(f => f.charge > 0)) throw new Error('vertices must have fermions that are all electrons');
  }

  assertAllPositrons() {
    if (this.fermions.find(f => f.charge < 0)) throw new Error('vertices must have fermions that are all positrons');
  }
}

// where a fermion emits a photon
class EmitVertex extends InnerVertex {
  constructor(...particles) {
    super(...particles);

    this.boson.from = this;

    const [incoming, outgoing] = this.fermions;

    incoming.to = this;
    outgoing.from = this;
  }
}

// where a fermion absorbs a photon
class AbsorbVertex extends InnerVertex {
  constructor(...particles) {
    super(...particles);

    this.boson.to = this;

    const [incoming, outgoing] = this.fermions;

    incoming.to = this;
    outgoing.from = this;
  }
}

// where an electron emits a photon
export class ElectronEmitVertex extends EmitVertex {
  constructor(...particles) {
    super(...particles);
    this.assertAllElectrons();
  }
}

// where a positron emits a photon
export class PositronEmitVertex extends EmitVertex {
  constructor(...particles) {
    super(...particles);
    this.assertAllPositrons()
  }
}

// where an electron absorbs a photon
export class ElectronAbsorbVertex extends AbsorbVertex {
  constructor(...particles) {
    super(...particles);
    this.assertAllElectrons();
  }
}

// where a positron absorbs a photon
export class PositronAbsorbVertex extends AbsorbVertex {
  constructor(...particles) {
    super(...particles);
    this.assertAllPositrons()
  }
}

// when a photon produces an electron/positron pair
export class ProductionVertex extends InnerVertex {
  constructor(...particles) {
    super(...particles);
    this.assertOppositeCharge();

    this.boson.to = this;

    this.fermions.forEach(f => {
      f.from = this;
    });
  }
}

// when an electron/positron pair annihilate each other to form a photon
export class AnnihilationVertex extends InnerVertex {
  constructor(...particles) {
    super(...particles);
    this.assertOppositeCharge();

    this.boson.from = this;

    this.fermions.forEach(f => {
      f.to = this;
    });
  }
}

// origin points for on-shell particles
class OriginVertex extends Vertex {
  constructor(particle, incoming) {
    super(particle);
    this.incoming = incoming;
    this.origin = true;
  }
}

class IncomingVertex extends OriginVertex {
  constructor(particle) {
    super(particle, true);

    particle.from = this;
  }
}

class OutgoingVertex extends OriginVertex {
  constructor(particle) {
    super(particle, false);

    particle.to = this;
  }
}

export class Diagram {
  constructor(inputs, outputs, virtuals, vertices) {
    this.inputs   = inputs;
    this.outputs  = outputs;
    this.virtuals = virtuals;
    this.vertices = vertices;

    this.incomingVertices = this.inputs.map(p => new IncomingVertex(p, true));
    this.outgoingVertices = this.outputs.map(p => new OutgoingVertex(p, false));

    this.originVertices   = [...this.incomingVertices, ...this.outgoingVertices];

    this.allParticles     = [...this.inputs, ...this.outputs, ...this.virtuals];
    this.allVertices      = [...this.originVertices, ...this.vertices];
  }
}