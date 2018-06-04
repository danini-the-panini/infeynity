// TODO: make these configurable
export const RADIUS = 100;
export const CIRCLE_ORIGIN = [256, 256];

import { add, circleInvert, circleInvertCircle, distance, vectorLength, Circle } from './geometry';

class DrawingMode {
  constructor(drawingContext, outputTarget) {
    this.drawingContext = drawingContext;
  }

  startDrawing(e) {
  }

  movePen(e) {
  }

  stopDrawing(e) {
  }

  penGone(e) {
  }
}

export class PenDrawingMode extends DrawingMode {
  setPen({ layerX, layerY }) {
    this.lastPenLocation = this.penLocation;
    this.penLocation = [layerX, layerY];
    if (!this.lastPenLocation) this.lastPenLocation = this.penLocation;
  }

  unsetPen() {
    this.lastPenLocation = null;
    this.penLocation = null;
    this.busyDrawing = false;
  }

  makeMark() {
    this.drawingContext.beginPath();
    this.drawingContext.moveTo(...this.lastPenLocation);
    this.drawingContext.lineTo(...this.penLocation);
    this.drawingContext.strokeStyle = 'blue';
    this.drawingContext.stroke();

    this.drawingContext.beginPath();
    this.drawingContext.moveTo(...circleInvert(this.lastPenLocation, CIRCLE_ORIGIN, RADIUS));
    this.drawingContext.lineTo(...circleInvert(this.penLocation, CIRCLE_ORIGIN, RADIUS));
    this.drawingContext.strokeStyle = 'red';
    this.drawingContext.stroke();
  }

  startDrawing(e) {
    this.setPen(e);
    this.busyDrawing = true;
    this.makeMark();
  }

  movePen(e) {
    this.setPen(e)
    if (this.busyDrawing) {
      this.makeMark();
    }
  }

  stopDrawing(e) {
    this.setPen(e)
    this.busyDrawing = false;
  }

  penGone(e) {
    this.unsetPen();
  }
}

export class CircleDrawingMode extends DrawingMode {
  startDrawing({ layerX, layerY }) {
    this.circleCenter = [layerX, layerY];
    this.penLocation = [layerX, layerY];
  }

  movePen({ layerX, layerY }) {
    this.penLocation = [layerX, layerY];
  }

  stopDrawing() {
    this.circleRadius = distance(this.circleCenter, this.penLocation);
    this.drawingContext.strokeStyle = 'blue';
    new Circle(this.circleCenter, this.circleRadius).render(this.drawingContext);

    const [invertedOrigin, invertedRadius] = circleInvertCircle(this.circleCenter, this.circleRadius, CIRCLE_ORIGIN, RADIUS);

    this.drawingContext.strokeStyle = 'red';
    new Circle(invertedOrigin, invertedRadius).render(this.drawingContext);
  }

  penGone(e) {
  }
}