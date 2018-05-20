import { Controller } from "stimulus"
import { inputs, outputs, virtuals, incomingVertices, outgoingVertices, originVertices, innerVertices, allParticles, allVertices } from '../examples/example2';
import { Line, SquigglyLine, goingUp, goingDown } from '../geometry';

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

  createGeometry() {
    this.renderables = allParticles.map(particle => {
      switch (particle.charge) {
        case 0: return new PhotonLine(particle);
        case +1: return new PositronLine(particle);
        case -1: return new ElectronLine(particle);
      }
    });
  }

  generate() {
    // set anchor points of inputs and outputs (on-shell particles)
    incomingVertices.forEach((v, index) => {
      const lastIndex = incomingVertices.length - 1;
      v._displayPoint = [index / lastIndex, 0.0];
    });
    outgoingVertices.forEach((v, index) => {
      const lastIndex = outgoingVertices.length - 1;
      v._displayPoint = [index / lastIndex, 1.0];
    });

    // work out the physical positions of inernal vertices
    innerVertices.forEach(v => {
      v._displayPoint = [Math.random(), Math.random()];
    });

    this.createGeometry();
    this.render();
  }

  reprocess() {
    innerVertices.forEach(processVertex);

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