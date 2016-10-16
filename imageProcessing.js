const CANNY_LOW = 100;
const CANNY_HIGH = 200;
const GAUSSIAN_BLUR_SIZE = [5, 5];
const DILATE_ITERS = 3;

const MIN_RECT_AREA = 500;
const IS_CLOSED = true;

function filter(image) {
  const copy = image.copy();
  copy.gaussianBlur(GAUSSIAN_BLUR_SIZE);
  copy.canny(CANNY_LOW, CANNY_LOW);
  copy.dilate(DILATE_ITERS);
  return copy;
}

function findBiggestRectangle(image) {
  // boundingRect
  const contours = image.findContours();
  let biggestRectIndex = 0;
  let founded = false;
  for (let i = 0; i < contours.size(); i++) {
    if (contours.area(i) < MIN_RECT_AREA)
      continue;
    const arcLength = contours.arcLength(i, IS_CLOSED);
    contours.approxPolyDP(i, 0.1 * arcLength, IS_CLOSED);
    switch(contours.cornerCount(i)) {
      case 4:
        const currentArea = contours.area(i);
        if (currentArea > contours.area(biggestRectIndex)) {
          biggestRectIndex = i;
          founded = true;
        }
        break;
      default:
        continue;
    }
  }
  return founded
    ? contours.boundingRect(biggestRectIndex)
    : null;
}

module.exports.filter = filter;
module.exports.findBiggestRectangle = findBiggestRectangle;
