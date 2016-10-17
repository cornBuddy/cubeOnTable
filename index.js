// TODO: fix segmentation fault error
const cv = require('opencv');
const drawCube = require('./imageProcessing').drawCube;
const findTrack = require('./imageProcessing').findTrack;

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

function searchForTrack(camera) {
  return new Promise((resolve, reject) => {
    let pid = null;
    const search =  function() {
      camera.read((err, rawImage) => {
        if (err)
          reject(err);
        console.log('searching...');
        let track = findTrack(rawImage);
        if (track) {
          console.log('found!', track);
          clearInterval(pid);
          resolve(track);
        }
      });
    };
    pid = setInterval(search, MAGIC_NUMBER);
  });
}

function showImage(window, camera) {
  return (track) => {
    camera.read((err, rawImage) => {
      if (err) throw err;
      const imageWithCube = drawCube(rawImage, track);
      window.show(imageWithCube);
      if (window.blockingWaitKey(0, MAGIC_NUMBER) === ESC)
        process.exit(0);
    });
  };
}

const camera = initCamera();
const window = initWindow();
searchForTrack(camera)
  .then(showImage(window, camera));
