const getTrackedObject = require('./search').getTrackedObject;

const BLUE = [255, 0, 0];
const GREEN = [0, 255, 0];
const RED = [0, 0, 255];

function drawAxis(image, points) {
  points = points.sort((p, c) => p.x - c.x);
  console.log(points);
  const o = points[0];
  image.line([o.x, o.y], [points[1].x, points[1].y], BLUE, 5);
  image.line([o.x, o.y], [points[2].x, points[2].y], GREEN, 5);
  image.line([o.x, o.y], [o.x, o.y - 400], RED, 5);
  return image;
}

module.exports.drawAxis = drawAxis;
