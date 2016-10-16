const CANNY_LOW = 100;
const CANNY_HIGH = 200;
const GAUSSIAN_BLUR_SIZE = [5, 5];
const DILATE_ITERS = 3;

function filter(image) {
  const copy = image.copy();
  copy.gaussianBlur(GAUSSIAN_BLUR_SIZE);
  copy.canny(CANNY_LOW, CANNY_LOW);
  copy.dilate(DILATE_ITERS);
  return copy;
}

module.exports.filter = filter;
