// TODO: fix segmentation fault error
const cv = require('opencv');
const drawCube = require('./imageProcessing').drawCube;
const findTrack = require('./imageProcessing').findTrack;

const CAM_HEIGHT = 240;
const CAM_WIDTH = 320;
const MAGIC_NUMBER = 200;
const ESC = 27;

let track = null;
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

function searchForTrack(camera) {
  const search =  function() {
    camera.read((err, rawImage) => {
      console.log('searching...');
      track = findTrack(rawImage);
      if (track) {
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
    const imageWithCube = drawCube(rawImage, track);
    window.show(imageWithCube);
    if (window.blockingWaitKey(0, MAGIC_NUMBER) === ESC)
      process.exit(0);
  });
}

const camera = initCamera();
searchForTrack(camera);
const window = initWindow();
showImageFromCamera(window, camera);
