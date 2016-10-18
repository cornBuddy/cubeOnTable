// TODO: fix segmentation fault error
const cv = require('opencv');
const filter = require('./imageProcessing').filter
const drawAxis = require('./imageProcessing').drawAxis;
const findTrack = require('./imageProcessing').findTrack;
const getRectPoints = require('./imageProcessing').getRectPoints;
const findBiggestRectangleIndex
  = require('./imageProcessing').findBiggestRectangleIndex;

const CAM_HEIGHT = 240;
const CAM_WIDTH = 320;
const MAGIC_NUMBER = 200;
const ESC = 27;

function initCamera() {
  const camera = new cv.VideoCapture(0);
  camera.setWidth(CAM_WIDTH);
  camera.setHeight(CAM_HEIGHT);
  return camera;
}

function initWindow() {
  return new cv.NamedWindow('Tracking', 0);
}

function readImage(path) {
  return new Promise((resolve, reject) => {
    cv.readImage((path), (err, image) => {
      if (err)
        reject(err);
      if (image.width() < CAM_WIDTH || image.height() < CAM_HEIGHT)
        reject(new Error('image is too small'));
      resolve(image);
    });
  });
}

function searchForTable(rawImage) {
  const filtered = filter(rawImage);
  const contours = filtered.findContours();
  const biggestRectInd = findBiggestRectangleIndex(contours);
  if (biggestRectInd === -1)
    throw new Error('there is no rectangle!');
  return {
    points: getRectPoints(contours, biggestRectInd),
    image: rawImage,
  };
}

function drawAxisAndShow(window) {
  return function(obj) {
    const image = drawAxis(obj.image, obj.points);
    window.show(image);
    if (window.blockingWaitKey(0, 0) === ESC)
      process.exit(0);
  };
}

const window = initWindow();
const path = process.argv[2];
readImage(path)
  .then(searchForTable)
  .then(drawAxisAndShow(window));
//let track = null;
//let i = 0;
//camera.read((err) => {
//  if (err) throw err;
//  const cb = () => {
//    camera.read((err, img) => {
//      while (!track) {
//        i++
//        track = findTrack(img);
//        console.log('searching...', i);
//        if (i >= 200)
//          process.exit(0);
//      }
//      const rec = track.track(img);
//      img = filter(img);
//      img.roi(rec[0], rec[1], rec[2] - rec[0], rec[3] - rec[1]);
//      window.show(img);
//      if (window.blockingWaitKey(0, MAGIC_NUMBER) === ESC)
//        process.exit(0);
//    });
//  };
//  setInterval(cb, MAGIC_NUMBER);
//});
