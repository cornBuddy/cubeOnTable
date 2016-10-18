const getTrackedObject = require('./search').getTrackedObject;

const BLUE = [255, 0, 0];
const GREEN = [0, 255, 0];

function drawAxis(image, points) {
  points = points.sort((p, c) => p.x - c.x);
  const o = points[0];
  image.line([o.x, o.y], [points[1].x, points[1].y], BLUE, 10);
  image.line([o.x, o.y], [points[2].x, points[2].y], GREEN, 10);
  return image;
}

module.exports.drawAxis = drawAxis;
