const cv = require('opencv');

// DO NOT TOUCH CONTSANTS NOW!
const CANNY_LOW = 200;
const CANNY_HIGH = 200;
const GAUSSIAN_BLUR_SIZE = [7, 7];
const DILATE_ITERS = 1;

const MIN_RECT_AREA = 100;
const IS_CLOSED = true;
const DELTA = 0.01;

function filter(image) {
  const copy = image.copy();
  copy.canny(CANNY_LOW, CANNY_HIGH);
  copy.gaussianBlur(GAUSSIAN_BLUR_SIZE);
  return copy;
}

function invalidArea(area) {
  return area < MIN_RECT_AREA;
}

function getRectPoints(contours, index) {
  let points = [];
  for (let p = 0; p < 4; p++)
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
  if (biggestRectInd === -1)
    return null;
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
  // FIXME: [0,0,1,1], WTF?
  const rect = track.track(image);
  image.save(`${__dirname}/debug/`
      + `getTrackedObject-start-${Date.now()}.jpg`);
  console.log(`rect to track: [${rect}]`);
  // FIXME: assertion failure here sometimes
  let region = image.crop(rect[0], rect[1], rect[2] - rect[0],
      rect[3] - rect[1]);
  region = filter(region);
  region.save(`${__dirname}/debug/`
      + `getTrackedObject-region-${Date.now()}.jpg`);
  console.log('region found');
  const contours = region.findContours();
  console.log('contours found');
  // FIXME: sometimes biggestRectInd === -1
  const biggestRectInd = findBiggestRectangleIndex(contours);
  if (biggestRectInd === -1)
    throw Error('tracked object moved from camera');
  console.log('biggest rect found');
  const contourImg = new cv.Matrix(region.height, region.width);
  contourImg.drawContour(contourImg, biggestRectInd);
  contourImg.save(`${__dirname}/debug/`
      + `getTrackedObject-contour-${Date.now()}.jpg`);
  const points = getRectPoints(contours, biggestRectInd);
  console.log('rect points found');
  // FIXME: return absolute coordinates
  return {
    points: points,
    rect: contours.boundingRect(biggestRectInd),
  };
}

module.exports.getTrackedObject = getTrackedObject;
module.exports.findTrack = findTrack;
module.exports.filter = filter;
module.exports.getRectPoints = getRectPoints;
module.exports.findBiggestRectangleIndex = findBiggestRectangleIndex;
