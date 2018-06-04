import { Controller } from "stimulus";
import { add, Circle } from '../geometry';
import { PenDrawingMode, CircleDrawingMode, RADIUS, CIRCLE_ORIGIN } from '../drawing_modes';

export default class extends Controller {
  static targets = ["canvas", "mode"];

  connect() {
    this.drawingContext = this.canvasTarget.getContext("2d");
    this.clearDrawing();

    this.drawingModes = {
      pen: new PenDrawingMode(this.drawingContext),
      circle: new CircleDrawingMode(this.drawingContext)
    }
  }

  get mode() {
    return this.modeTarget.value;
  }

  set mode(v) {
    return this.modeTarget.value = v;
  }

  get modeObject() {
    return this.drawingModes[this.mode];
  }

  usePenMode() { this.mode = 'pen' }
  useCircleMode() { this.mode = 'circle' }

  get canvasWidth() {
    return 512;
  }

  get canvasHeight() {
    return 512;
  }

  startDrawing(e) {
    this.modeObject.startDrawing(e);
  }

  movePen(e) {
    this.modeObject.movePen(e);
  }

  stopDrawing(e) {
    this.modeObject.stopDrawing(e);
  }

  penGone(e) {
    this.modeObject.penGone(e);
  }

  drawCircle() {
    this.drawingContext.strokeStyle = 'black';
    new Circle(CIRCLE_ORIGIN, RADIUS).render(this.drawingContext);
  }

  clearDrawing() {
    this.drawingContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.drawCircle();
  }
}