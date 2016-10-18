const getTrackedObject = require('./search').getTrackedObject;

// bgr
const BLUE = [255, 0, 0];
const GREEN = [0, 255, 0];

function drawAxis(image, points) {
  const o = points[3];
  image.line([o.x, o.y], [points[0].x, points[0].y], BLUE, 10);
  image.line([o.x, o.y], [points[2].x, points[2].y], GREEN, 10);
  return image;
}

module.exports.drawAxis = drawAxis;
