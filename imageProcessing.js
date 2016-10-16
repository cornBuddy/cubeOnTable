// TODO: find better constants vaules, bad detection
const CANNY_LOW = 80;
const CANNY_HIGH = 300;
const GAUSSIAN_BLUR_SIZE = [5, 5];
const DILATE_ITERS = 3;

const MIN_RECT_AREA = 100;
const MAX_RECT_AREA = 320 * 240 / 4;
const IS_CLOSED = true;
const DELTA = 0.03;

const BLUE = [255, 0, 0];
const GREEN = [0, 255, 0];
const RED = [0, 0, 255];

function filter(image) {
  const copy = image.copy();
  copy.gaussianBlur(GAUSSIAN_BLUR_SIZE);
  copy.canny(CANNY_LOW, CANNY_LOW);
  copy.dilate(DILATE_ITERS);
  return copy;
}

function findTrackedObject(image) {
  const contours = image.findContours();
  let biggestRectIndex = 0;
  let founded = false;
  let points = [];
  for (let i = 0; i < contours.size(); i++) {
    if (contours.area(i) < MIN_RECT_AREA || contours.area(i) > MAX_RECT_AREA)
      continue;
    const arcLength = contours.arcLength(i, IS_CLOSED);
    contours.approxPolyDP(i, DELTA * arcLength, IS_CLOSED);
    switch(contours.cornerCount(i)) {
      case 4:
        const r = contours.boundingRect(i);
        image.rectangle([r.x, r.y], [r.width, r.height], BLUE);
        const currentArea = contours.area(i);
        if (currentArea > contours.area(biggestRectIndex)) {
          founded = true;
          points = [];
          biggestRectIndex = i;
          for (let p = 0; p < 4; p++) {
            const point = contours.point(i, p);
            points.push(point);
          }
        }
        break;
      default:
        continue;
    }
  }
  return founded
    ? { points: points, rect: contours.boundingRect(biggestRectIndex) }
    : null;
}

function drawAxis(image, object) {
  console.log(object);
  for (const p of object.points)
    image.ellipse(p.x, p.y);
  const o = object.points[0];
  image.line([o.x, o.y], [object.points[3].x, object.points[3].y], RED);
  image.line([o.x, o.y], [object.points[2].x, object.points[2].y], GREEN);
  const r = object.rect;
  image.rectangle([r.x, r.y], [r.width, r.height]);
}

module.exports.filter = filter;
module.exports.findTrackedObject = findTrackedObject;
module.exports.drawAxis = drawAxis;
