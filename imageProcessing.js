const CANNY_LOW = 300;
const CANNY_HIGH = 400;
const GAUSSIAN_BLUR_SIZE = [3, 3];
const DILATE_ITERS = 5;

const MIN_RECT_AREA = 100;
const IS_CLOSED = true;
const DELTA = 0.1;

function filter(image) {
  const copy = image.copy();
  copy.gaussianBlur(GAUSSIAN_BLUR_SIZE);
  copy.canny(CANNY_LOW, CANNY_LOW);
  copy.dilate(DILATE_ITERS);
  return copy;
}

function findBiggestRectangleCorners(image) {
  const contours = image.findContours();
  let biggestRectIndex = 0;
  let founded = false;
  let points = [];
  for (let i = 0; i < contours.size(); i++) {
    if (contours.area(i) < MIN_RECT_AREA)
      continue;
    const arcLength = contours.arcLength(i, IS_CLOSED);
    contours.approxPolyDP(i, DELTA * arcLength, IS_CLOSED);
    switch(contours.cornerCount(i)) {
      case 4:
        const currentArea = contours.area(i);
        if (currentArea > contours.area(biggestRectIndex)) {
          founded = true;
          points = [];
          for (let p = 0; p < 4; p++)
            points.push(contours.point(i, p));
        }
        break;
      default:
        continue;
    }
  }
  return founded
    ? points
    : null;
}

module.exports.filter = filter;
module.exports.findBiggestRectangleCorners = findBiggestRectangleCorners;
