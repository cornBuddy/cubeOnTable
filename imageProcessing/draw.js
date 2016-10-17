const getTrackedObject = require('./search').getTrackedObject;

function drawAxis(image, points) {
  console.log('preparing to draw cube');
  const o = points[0];
  console.log('draw axis');
  image.line([o.x, o.y], [points[1].x, points[1].y]);
  image.line([o.x, o.y], [points[2].x, points[2].y]);
  return image;
}

module.exports.drawAxis = drawAxis;
