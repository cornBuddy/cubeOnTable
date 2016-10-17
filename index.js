// TODO: fix segmentation fault error
const cv = require('opencv');
const track = require('./imageProcessing').drawCube;
const findTrackedObject = require('./imageProcessing').findTrackedObject;

const CAM_HEIGHT = 240;
const CAM_WIDTH = 320;
const MAGIC_NUMBER = 200;
const ESC = 27;

let object = null;
let pid = null;

function initCamera() {
  const camera = new cv.VideoCapture(0);
  camera.setWidth(CAM_WIDTH);
  camera.setHeight(CAM_HEIGHT);
  return camera;
}

function initWindow() {
  return new cv.NamedWindow('Tracking', 0);
}

function findObject(camera) {
  const search =  function() {
    camera.read((err, rawImage) => {
      console.log('searching...');
      object = findTrackedObject(rawImage);
      if (object) {
        console.log('found!');
        clearInterval(pid);
        return;
      }
    });
  };
  pid = setInterval(search, MAGIC_NUMBER);
}

function showImageFromCamera(window, camera, cb) {
  camera.read((err, rawImage) => {
    if (err) throw err;
    const imageWithCube = drawCube(rawImage, object);
    window.show(imageWithCube);
    if (window.blockingWaitKey(0, MAGIC_NUMBER) === ESC)
      process.exit(0);
  });
}

const camera = initCamera();
findObject(camera);
const window = initWindow();
showImageFromCamera(window, camera);
