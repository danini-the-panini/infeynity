import { Controller } from "stimulus"
import { Line, SquigglyLine, swap } from '../geometry';

import diagram1 from '../examples/example1';
import diagram2 from '../examples/example2';
import diagram3 from '../examples/example3';
import diagram4 from '../examples/example4';

function centroidifyVertex(vertex) {
  const neighbours = vertex.getNeighbours();

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

function moveBelow(top, bottom) {
  top[1] += 0.01 + Math.random() * 0.005;
  bottom[1] -= 0.01 + Math.random() * 0.005;
}

function timeLegitimizeVertex(vertex) {
  const fromNeighbours = vertex.fromNeighbours();
  const toNeighbours = vertex.toNeighbours();
  const neighbours = [...fromNeighbours, ...toNeighbours];

  fromNeighbours.forEach(n => {
    if (n.origin) return;
    moveBelow(vertex._displayPoint, n._displayPoint);
  });
  toNeighbours.forEach(n => {
    if (n.origin) return;
    moveBelow(n._displayPoint, vertex._displayPoint);
  });
}

function processVertex(vertex) {
  centroidifyVertex(vertex);
  timeLegitimizeVertex(vertex);
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
    super(...linePoints(particle), 'e⁻');
  }
}

class PositronLine extends Line {
  constructor(particle) {
    super(...swap(...linePoints(particle)), 'e⁺');
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

  generate1() { this.generate(diagram1); }
  generate2() { this.generate(diagram2); }
  generate3() { this.generate(diagram3); }
  generate4() { this.generate(diagram4); }

  generate(diagram = this.diagram) {
    this.diagram = diagram;

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
    for (let i = 0; i < 7; i++ ) {
      this.diagram.vertices.forEach(centroidifyVertex);
    }
    this.diagram.vertices.forEach(timeLegitimizeVertex);

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