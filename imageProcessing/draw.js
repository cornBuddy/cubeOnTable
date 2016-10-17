const getTrackedObject = require('./search').getTrackedObject;

function drawCube(image, track) {
  console.log('preparing to draw cube');
  const object = getTrackedObject(image, track);
  // TODO: write some code
  console.log(`tracked object: ${object}`);
  const points = object.points;
  const o = points[0];
  console.log('draw axis');
  image.line([o.x, o.y], [points[1].x, points[1].y]);
  image.line([o.x, o.y], [points[2].x, points[2].y]);
  return image;
}

module.exports.drawCube = drawCube;
