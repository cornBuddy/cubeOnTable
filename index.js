// TODO: fix segmentation fault error
const cv = require('opencv');
const track = require('./imageProcessing').track;
const findTrackedObject = require('./imageProcessing').findTrackedObject;

const CAM_HEIGHT = 240;
const CAM_WIDTH = 320;
const MAGIC_NUMBER = 200;

function detectObjectsFromCamera(camera, window) {
  return function() {
    camera.read((err, image) => {
      const object = findTrackedObject(image);
      if (object === null)
        console.log('there is no rectangle');
      else
        track(image, object);
      window.show(image);
      if (window.blockingWaitKey(0, MAGIC_NUMBER) === 27)
        process.exit(0);
    });
  }
}

try {
  const window = new cv.NamedWindow('Video', cv.WINDOW_AUTOSIZE);
  const camera = new cv.VideoCapture(0);
  camera.setWidth(CAM_WIDTH);
  camera.setHeight(CAM_HEIGHT);
  setInterval(detectObjectsFromCamera(camera, window), MAGIC_NUMBER);
} catch (e){
  console.log("Couldn't start camera:", e)
}
