function sub([x1, y1], [x2, y2]) {
  return [x1 - x2, y1 - y2];
}

export function add([x1, y1], [x2, y2]) {
  return [x1 + x2, y1 + y2];
}

// circle inversion functions derived from here: http://mathworld.wolfram.com/Inversion.html

// perform circle inversion
// p -> the point
// o -> origin of the inversion circle
// k -> radius of the inversion circle (inversion radius)
// returns [x2, y2] -> the inverted point
export function circleInvert(p, o, k) {
  const ksq = k*k;
  return add(o, div(mul(sub(p, o), ksq), distanceSq(p, o)));
}

// perform a circle inversion of a circle
// c -> origin of the circle to be inverted
// a -> radius of the circle to be inverted
// o -> origin of the inversion circle
// k -> radius of the inversion circle (inversion radius)
// returns [[cx2, cy2], a2] -> the inverted circle's origin and radius
export function circleInvertCircle(c, a, o, k) {
  const [x, y] = c;
  const [ox, oy] = o;
  const ksq = k ** 2;
  const s = ksq / ((x - ox)**2 + (y - oy)**2 - a**2);
  return [add(o, mul(sub(c, o), s)), Math.abs(s) * a];
}

function mul([x, y], s) {
  return [x * s, y * s];
}

function div([x, y], s) {
  return [x / s, y / s];
}

function distanceSq(a, b) {
  return vectorLengthSq(sub(a, b));
}

export function distance(a, b) {
  return vectorLength(sub(a, b));
}
 
function vectorLengthSq([x, y]) {
  return x * x + y * y
}

export function vectorLength(v) {
  return Math.sqrt(vectorLengthSq(v));
}

function length([x1, y1], [x2, y2]) {
  return vectorLength([x2 - x1, y2 - y1]);
}

function normalize(vector) {
  return div(vector, vectorLength(vector));
}

function rotCW([x, y]) {
  return [y, -x];
}

function rotCCW([x, y]) {
  return [-y, x];
}

function flipY([x, y]) {
  return [x, -y];
}

function flipX([x, y]) {
  return [-x, y];
}

function scale([x, y], [scalex, scaley]) {
  return [x * scalex, (1.0 - y) * scaley];
}

function lerp1(v0, v1, t) {
  return v0 + t * (v1 - v0);
}

function lerp([x1, y1], [x2, y2], t) {
  return [lerp1(x1, x2, t), lerp1(y1, y2, t)];
}

function bestSegmentCount(totalLength, segmentLength) {
  return Math.floor(totalLength / segmentLength);
}

function avg(a) {
  return a.reduce((x, y) => x + y) / a.length;
}

export function swap(a, b) {
  return [b, a];
}

export class Line {
  constructor(start, end, label = '-') {
    this.start = start;
    this.end = end;
    this.label = label;

    this.length = length(this.start, this.end);
    this.normal = div(sub(this.end, this.start), this.length);
    this.tangent = rotCW(this.normal);
    this.bitangent = rotCCW(this.normal);

    this.uptangent = [this.tangent, this.bitangent].find(t => t[1] > 0);

    this.drawn = false;
  }

  render(ctx, s) {
    if (this.drawn) return;

    ctx.beginPath();
    ctx.moveTo(...scale(this.start, s));
    ctx.lineTo(...scale(this.end, s));
    ctx.stroke();

    ctx.beginPath();
    const midWay = lerp(this.start, this.end, 0.48);
    const a = add(midWay, mul(this.tangent, 0.01));
    const b = add(midWay, mul(this.bitangent, 0.01));
    const c = add(midWay, mul(this.normal, 0.03));
    ctx.moveTo(...scale(a, s));
    ctx.lineTo(...scale(b, s));
    ctx.lineTo(...scale(c, s));
    ctx.fill();

    this.renderLabel(ctx, s);

    this.drawn = true;
  }

  renderLabel(ctx, s) {
    ctx.font = '16px serif';
    ctx.textAlign = "center";
    ctx.fillText(this.label, ...scale(add(lerp(this.start, this.end, 0.5), mul(this.uptangent, 16.0 / avg(s))), s));
  }
}

export class SquigglyLine extends Line {
  constructor(start, end, label = '~', squiggleLength = 0.02, squiggleWidth = 0.01) {
    super(start, end, label);

    this.squiggleCount = bestSegmentCount(this.length, squiggleLength);
    this.squiggleLength = this.length / this.squiggleCount;
    this.squiggleWidth = squiggleWidth;
  }

  render(ctx, s) {
    if (this.drawn) return;

    ctx.beginPath();
    ctx.moveTo(...scale(this.start, s));

    for (let i = 0; i < this.squiggleCount; i++) {
      const a = add(this.start, mul(this.normal, this.squiggleLength * i));
      const b = add(this.start, mul(this.normal, this.squiggleLength * (i + 1)));

      const t = mul(((i % 2 === 0) ? this.tangent : this.bitangent), this.squiggleWidth);

      const t1 = add(a, t);
      const t2 = add(b, t);

      const W = 0.2716;
      const cp1 = lerp(t1, t2, W);
      const cp2 = lerp(t2, t1, W);

      ctx.bezierCurveTo(
        ...scale(cp1, s),
        ...scale(cp2, s),
        ...scale(b, s),
      );
    }

    ctx.stroke();

    this.renderLabel(ctx, s);

    this.drawn = true;
  }
}

export class Circle {
  constructor(origin, radius) {
    this.origin = origin;
    this.radius = radius;
  }

  render(ctx) {
    if (this.drawn) return;

    ctx.beginPath();
    ctx.arc(...this.origin, this.radius, 0, 2 * Math.PI);
    ctx.moveTo(...this.origin);
    ctx.lineTo(...add(this.origin, [1, 1]));
    ctx.stroke();

    this.drawn = true;
  }
}