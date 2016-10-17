// TODO: fix segmentation fault error
const cv = require('opencv');
const track = require('./imageProcessing').track;
const findTrackedObject = require('./imageProcessing').findTrackedObject;

const CAM_HEIGHT = 240;
const CAM_WIDTH = 320;
const MAGIC_NUMBER = 200;

let object = null;
let pid = null;

function findObject(camera) {
  const search =  function() {
    camera.read((err, rawImage) => {
      console.log('searching...');
      object = findTrackedObject(rawImage);
      if (object) {
        console.log('found!', object);
        clearInterval(pid);
        return;
      }
    });
  };
  pid = setInterval(search, MAGIC_NUMBER);
}

const camera = new cv.VideoCapture(0);
camera.setWidth(CAM_WIDTH);
camera.setHeight(CAM_HEIGHT);
findObject(camera);
