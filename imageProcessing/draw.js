const getTrackedObject = require('./search').getTrackedObject;

function drawCube(image, track) {
  const object = getTrackedObject(image, track);
  // TODO: write some code
  const points = object.points;
  const o = points[0];
  image.line([o.x, o.y], [points[1].x, points[1].y]);
  image.line([o.x, o.y], [points[2].x, points[2].y]);
}

module.exports.drawCube = drawCube;
