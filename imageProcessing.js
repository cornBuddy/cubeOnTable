const cv = require('opencv');

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

function invalidArea(area) {
  return area < MIN_RECT_AREA || area > MAX_RECT_AREA;
}

function findBiggestRectangleIndex(contours) {
  let biggestRectIndex = 0;
  let found = false;
  for (let i = 0; i < contours.size(); i++) {
    if (invalidArea(contours.area(i)))
      continue;
    const arcLength = contours.arcLength(i, IS_CLOSED);
    contours.approxPolyDP(i, DELTA * arcLength, IS_CLOSED);
    const currentArea = contours.area(i);
    if (contours.cornerCount(i) === 4
        && currentArea > contours.area(biggestRectIndex)) {
      found = true;
      biggestRectIndex = i;
    } else {
      continue;
    }
  }
  if (found)
    return biggestRectIndex,
  else
    return -1;
}

function findTrackedObject(rawImage) {
  const image = filter(rawImage);
  const contours = image.findContours();
  const biggestRectInd = findBiggestRectangleIndex(contours);
  if (biggestRectInd === -1) {
    return null;
  }
  const rect = contours.boundingRect(biggestRectInd);
  const r = [rect.x, rect.y, rect.width + rect.x, rect.height + rect.y];
  console.log(r);
  console.log(`image: [w=${rawImage.width()}, h=${rawImage.height()}]`);
  console.log(`rect: [w=${rect.width}, h=${rect.height}];`
      + ` [x=${rect.x}, y=${rect.y}]`);
  return new cv.TrackedObject(rawImage, r, {channel: 'value'});
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

function track(image, object) {
  return object.track.track(image);
}

function drawCube(image, object) {
  const rect = track(image, object);
}

module.exports.findTrackedObject = findTrackedObject;
module.exports.drawCube = drawCube;
