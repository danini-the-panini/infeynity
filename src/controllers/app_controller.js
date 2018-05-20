import { Controller } from "stimulus"
import { Line, SquigglyLine, goingUp, goingDown } from '../geometry';

import diagram1 from '../examples/example1';
import diagram2 from '../examples/example2';
import diagram3 from '../examples/example3';

function processVertex(vertex) {
  const neighbours = vertex.neighbours;

  let x = 0;
  let y = 0;
  neighbours.forEach(n => {
    x += n._displayPoint[0];
    y += n._displayPoint[1];
  });
  x /= neighbours.length;
  y /= neighbours.length;

  vertex._displayPoint = [x, y];
}

function linePoints(particle) {
  return particle.vertices.map(v => v._displayPoint);
}

class PhotonLine extends SquigglyLine {
  constructor(particle) {
    super(...linePoints(particle), 'γ');
  }
}

class ElectronLine extends Line {
  constructor(particle) {
    super(...goingUp(...linePoints(particle)), 'e⁻');
  }
}

class PositronLine extends Line {
  constructor(particle) {
    super(...goingDown(...linePoints(particle)), 'e⁺');
  }
}

export default class extends Controller {
  static targets = ["canvas"];

  connect() {
    this.context = this.canvasTarget.getContext("2d");
    this.renderables = [];
  }

  get canvasWidth() {
    return 512;
  }

  get canvasHeight() {
    return 512;
  }

  generate1() {
    this.diagram = diagram1;
    this.generate();
  }

  generate2() {
    this.diagram = diagram2;
    this.generate();
  }

  generate3() {
    this.diagram = diagram3;
    this.generate();
  }

  generate() {
    // set anchor points of inputs and outputs (on-shell particles)
    this.diagram.incomingVertices.forEach((v, index) => {
      const lastIndex = this.diagram.incomingVertices.length - 1;
      v._displayPoint = [index / lastIndex, 0.0];
    });
    this.diagram.outgoingVertices.forEach((v, index) => {
      const lastIndex = this.diagram.outgoingVertices.length - 1;
      v._displayPoint = [index / lastIndex, 1.0];
    });

    // work out the physical positions of inernal vertices
    this.diagram.vertices.forEach(v => {
      v._displayPoint = [Math.random(), Math.random()];
    });

    this.processAndRender();
  }

  createGeometry() {
    this.renderables = this.diagram.allParticles.map(particle => {
      switch (particle.charge) {
        case 0: return new PhotonLine(particle);
        case +1: return new PositronLine(particle);
        case -1: return new ElectronLine(particle);
      }
    });
  }

  processAndRender() {
    for (let i = 0; i < 20; i++ ) {
      this.diagram.vertices.forEach(processVertex);
    }

    this.createGeometry();
    this.render();
  }

  render() {
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.renderables.forEach(r => {
      r.drawn = false;
      r.render(this.context, [this.canvasWidth, this.canvasHeight]);
    });
  }
}