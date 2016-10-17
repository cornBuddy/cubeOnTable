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

function getRectPoints(contours, index) {
  let points = [];
  for (let p = 0; i < 4; p++)
    points.push(contours.point(index, p));
  return points;
}

function roi(rect) {
  return [rect.x, rect.y, rect.width + rect.x, rect.height + rect.y];
}

function findTrack(rawImage) {
  const image = filter(rawImage);
  const contours = image.findContours();
  const biggestRectInd = findBiggestRectangleIndex(contours);
  if (biggestRectInd === -1) {
    return null;
  }
  const rect = contours.boundingRect(biggestRectInd);
  const r = roi(rect);
  return new cv.TrackedObject(rawImage, r, {channel: 'value'});
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
    return biggestRectIndex;
  else
    return -1;
}

function getTrackedObject(image, track) {
  const rect = track.track(image);
  console.log(`rect to track: [${rect}]`);
  const copy = image.copy();
  copy.roi(rect);
  const contours = copy.contours();
  const biggestRectInd = findBiggestRectangleIndex(contours);
  if (biggestRectIndex === -1)
    throw Error('tracked object moved from camera');
  const points = getRectPoints(contours, biggestRectInd);
  return {
    points: points,
    rect: contours.boundingRect(biggestRectInd),
  };
}

module.exports.getTrackedObject = getTrackedObject;
module.exports.findTrack = findTrack;
