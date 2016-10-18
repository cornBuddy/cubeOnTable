const cv = require('opencv');

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
  const objp = cv.Matrix.Zeros(image.height(), image.width());
  // hardbone
  const cameraMatrix = [
    [0, 0, 0,],
    [0, 0, 0,],
    [0, 0, 1,],
  ];
  const dist = [0, 0, 0, 0,];
  const test = cv.calib3d.solvePnP(objp, points, cameraMatrix, dist);
  return image;
}

module.exports.drawAxis = drawAxis;
