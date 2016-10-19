const cv = require('opencv');

const getTrackedObject = require('./search').getTrackedObject;

const BLUE = [255, 0, 0];
const GREEN = [0, 255, 0];
const RED = [0, 0, 255];

const FOCAL = 50; // [25; 50] -> [focal; plane]

function generate3dMatrixOfPoints(points2d) {
  return points2d.map(c => {
    c.z = 0;
    return c;
  });
}

function createCameraMatrix(image) {
  console.log('generating camera matrix');
  const fx = 0.5 + FOCAL / 50;
  const w = image.width();
  const h = image.height();
  console.log(`fx=${fx}; w=${w}; h=${h}`);
  let k = cv.Matrix.Zeros(3, 3);
  k.set(0, 0, fx * w);
  k.set(0, 2, 0.5 * (w - 1));
  k.set(1, 1, fx * w);
  k.set(1, 2, 0.5 * (h - 1));
  k.set(2, 2, 1);
  // output:
  // [fx * w, 0,      0.5 * (w - 1),],
  // [0,      fx * w, 0.5 * (h - 1),],
  // [0,      0,      1,            ],
  console.log('camera matrix:');
  for (let i = 0; i < 3; i++)
    console.log(k.row(i));
  return k;
}

function createDistorsions() {
  console.log('generating distorsions');
  let dist = cv.Matrix.Zeros(1, 4);
  console.log('distorsions:', dist.row(0));
  // output:
  // [0, 0, 0, 0]
  return dist;
}

function drawAxis(image, points) {
  // objp - should be 3d array of points (eg obj.x, obj.y, obj.z)
  // points - should be 2d array of floats (eg obj.x, obj.y)
  // problem should be in cameraMatrix or dist
  // https://github.com/opencv/opencv/blob/master/samples/python/plane_ar.py#L95
  points = points.sort((p, c) => p.x - c.x);
  const o = points[0];
  image.line([o.x, o.y], [points[1].x, points[1].y], BLUE, 5);
  image.line([o.x, o.y], [points[2].x, points[2].y], GREEN, 5);
  // objp - points3fFromArray
  // points - points2fFromArray
  const objp = generate3dMatrixOfPoints(points);
  // matFromMatrix
  const cameraMatrix = createCameraMatrix(image);
  // matFromMatrix
  const dist = createDistorsions();
  const test = cv.calib3d.solvePnP(objp, points, cameraMatrix, dist);
  console.log(test);
  return image;
}

module.exports.drawAxis = drawAxis;
