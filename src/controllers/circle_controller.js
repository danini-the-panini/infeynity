import { Controller } from "stimulus";
import { add, circleInvert } from '../geometry';

const RADIUS = 100;
const CIRCLE_ORIGIN = [256, 256]

export default class extends Controller {
  static targets = ["canvas", "output"];

  connect() {
    this.drawingContext = this.canvasTarget.getContext("2d")
    this.clearDrawing();
  }

  get canvasWidth() {
    return 512;
  }

  get canvasHeight() {
    return 512;
  }

  setPen({ layerX, layerY }) {
    this.lastPenLocation = this.penLocation;
    this.penLocation = [layerX, layerY];
    if (!this.lastPenLocation) this.lastPenLocation = this.penLocation;
    this.outputTarget.value = `${layerX}, ${layerY}`;
  }

  unsetPen() {
    this.lastPenLocation = null;
    this.penLocation = null;
    this.busyDrawing = false;
    this.outputTarget.value = `N/A`;
  }

  makeMark() {
    this.drawingContext.beginPath();

    this.drawingContext.moveTo(...this.lastPenLocation);
    this.drawingContext.lineTo(...this.penLocation);

    this.drawingContext.moveTo(...circleInvert(this.lastPenLocation, CIRCLE_ORIGIN, RADIUS));
    this.drawingContext.lineTo(...circleInvert(this.penLocation, CIRCLE_ORIGIN, RADIUS));

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
    this.unsetPen()
  }

  drawCircle() {
    this.drawingContext.beginPath();
    this.drawingContext.arc(...CIRCLE_ORIGIN, RADIUS, 0, 2 * Math.PI);
    this.drawingContext.moveTo(...CIRCLE_ORIGIN);
    this.drawingContext.lineTo(...add(CIRCLE_ORIGIN, [1,1]));
    this.drawingContext.stroke();
  }

  clearDrawing() {
    this.drawingContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.drawCircle();
  }
}