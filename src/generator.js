import { Electron, Positron, Photon, Diagram, IncomingVertex, OutgoingVertex } from './feynman';

function sample(array) {
  if (array.length <= 0) return null;
  if (array.length === 1) return array[0];
  const r = Math.floor(Math.random() * array.length);
  if (r >= array.length) return array[array.length - 1];
  if (r <= 0) return array[0];
  return array[r];
}

function randomParticleType() {
  return sample([Electron, Positron, Photon]);
}

export default class Generator {
  constructor() {
    this.inputTypes = [randomParticleType(), randomParticleType()]
    this.outputTypes = Math.random() < 0.5 ? this.inputTypes : [this.inputTypes[1], this.inputTypes[0]];
  }

  generate() {
    this.lastId = 0;

    console.log('----- GENERATING -----')
    this.inputs = this.inputTypes.map(T => new T);
    this.outputs = this.outputTypes.map(T => new T);

    this.inputs.forEach(p => new IncomingVertex(p));
    this.outputs.forEach(p => new OutgoingVertex(p));

    this.unlinkedParticles = [...this.inputs, ...this.outputs];

    console.log('inputs ', this.printThings(this.inputs));
    console.log('outputs', this.printThings(this.outputs));

    this.vertices = [];
    this.virtuals = [];

    do
    {
      const particle = this.takeUnlinkedParticle();
      console.log('chosen particle: ', this.printThing(particle));
      const vertex = this.generateVertex(particle);
      this.vertices.push(vertex);
      this.printInfo();
    }
    while (this.unlinkedParticles.length > 0);

    return new Diagram(this.inputs, this.outputs, this.virtuals, this.vertices);
  }

  printInfo() {
    console.log('----- info -----')
    console.log('unlinked:', this.printThings(this.unlinkedParticles));
    console.log('virtuals:', this.printThings(this.virtuals));
    console.log('vertices:', this.printThings(this.vertices));
  }

  printThing(t) {
    if (t.isParticle) {
      return `${t.constructor.name}(${t.id}) ${t.fromVertex ? t.fromVertex.id : '_'} -> ${t.toVertex ? t.toVertex.id : '_'}`;
    } else if (t.isVertex) {
      return `${t.constructor.name}(${t.id}) ${t.incoming.map(p => p.id).join(',')} -> ${t.outgoing.map(p => p.id).join(',')}`;
    }
  }

  printThings(things) {
    return things.map(t => this.printThing(t));
  }

  generateVertex(particle) {
    let VertexType;
    let inputs;
    let outputs;

    let chosen = [particle];

    const canChooseFrom = p => !p.from && !chosen.includes(p);
    const chooseFrom = T => {
      const p = this.randomParticleOfType(T, canChooseFrom);
      chosen.push(p);
      return p;
    }

    const canChooseTo = p => !p.to && !chosen.includes(p);
    const chooseTo = T => {
      const p = this.randomParticleOfType(T, canChooseTo);
      chosen.push(p);
      return p;
    }

    if (!particle.from) {
      VertexType = sample(particle.possibleFromVertices());

      let chosenSlot = false;
      outputs = VertexType.outputTypes.map(T => {
        if (!chosenSlot && T === particle.constructor) {
          chosenSlot = true;
          return particle;
        }
        return chooseFrom(T);
      });
      inputs = VertexType.inputTypes.map(T => {
        return chooseTo(T);
      });
    } else if (!particle.to) {
      VertexType = sample(particle.possibleToVertices());

      let chosenSlot = false;
      outputs = VertexType.outputTypes.map(T => {
        return chooseFrom(T);
      });
      inputs = VertexType.inputTypes.map(T => {
        if (!chosenSlot && T === particle.constructor) {
          chosenSlot = true;
          return particle;
        }
        return chooseTo(T);
      });
    } else {
      throw new Error('Chose a particle that is apparently completely linked: ' + this.printThing(particle));
    }

    console.log('----- new vertex -----');
    console.log(VertexType.name);
    console.log('inputs ', this.printThings(inputs));
    console.log('outputs', this.printThings(outputs));

    return new VertexType(...inputs, ...outputs);
  }

  takeUnlinkedParticle() {
    const particle = sample(this.unlinkedParticles);
    return this.takeSpecificUnlinkedParticle(particle);
  }

  takeSpecificUnlinkedParticle(particle) {
    this.unlinkedParticles = this.unlinkedParticles.filter(p => p !== particle);
    return particle;
  }

  randomParticleOfType(T, predicate = () => true) {
    const particle = sample(this.unlinkedParticles.filter(p => p.constructor === T && predicate(p)));
    if (!particle || Math.random() < (1/this.virtuals.length)*0.4) {
      return this.generateParticleOfType(T);
    }
    return this.takeSpecificUnlinkedParticle(particle);
  }

  generateParticleOfType(T) {
    const particle = new T();
    this.unlinkedParticles.push(particle);
    this.virtuals.push(particle);
    return particle;
  }
}