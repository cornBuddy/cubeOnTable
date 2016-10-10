function transformImage(image) {
  const copy = image.clone();
  copy.convertGrayscale();
  copy.medianBlur(5);
  copy.canny(0, 100);
  copy.dilate(2);
  return copy;
}

function crop(image, object) {
  const minus10perc = (n) => (Math.floor(n - n * 0.1));
  const plus20perc = (n) => (Math.floor(n + n * 0.2));
  const croppedX = minus10perc(object.x) >= 0
    ? minus10perc(object.x)
    : 0;
  const croppedY = minus10perc(object.y) >= 0
    ? minus10perc(object.y)
    : 0;
  const croppedHeight = plus20perc(object.height);
  const croppedWidth = plus20perc(object.width);
  return image.crop(croppedX, croppedY, croppedHeight, croppedWidth);
}

function findBiggestRectangle(image) {
  return null;
}

module.exports.transformImage = transformImage;
module.exports.crop = crop;
module.exports.findBiggestRectangle = findBiggestRectangle;