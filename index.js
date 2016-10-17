// TODO: fix segmentation fault error
const cv = require('opencv');
const filter = require('./imageProcessing').filter
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
    const search = () => {
      camera.read((err, rawImage) => {
        if (err)
          reject(err);
        console.log('searching...');
        let track = findTrack(rawImage);
        if (track) {
          console.log('found!');
          resolve(track);
        } else
          search();
      });
    };
    console.log('search started');
    search();
  });
}

function showImage(window, camera) {
  return (track) => {
    const show = () => {
      camera.read((err, rawImage) => {
        if (err) throw err;
        console.log('read image from camera');
        const imageWithCube = drawCube(rawImage, track);
        window.show(imageWithCube);
        if (window.blockingWaitKey(0, MAGIC_NUMBER) === ESC)
          process.exit(0);
      });
    };
    console.log('showing...');
    setInterval(show, MAGIC_NUMBER);
  };
}

const camera = initCamera();
const window = initWindow();
//searchForTrack(camera)
//  .then(showImage(window, camera));
let track = null;
let i = 0;
camera.read((err) => {
  if (err) throw err;
  const cb = () => {
    camera.read((err, img) => {
      while (!track) {
        i++
        track = findTrack(img);
        console.log('searching...', i);
        if (i >= 1000)
          process.exit(0);
      }
      const rec = track.track(img);
      img.rectangle([rec[0], rec[1]], [rec[2], rec[3]]);
      window.show(img);
      if (window.blockingWaitKey(0, MAGIC_NUMBER) === ESC)
        process.exit(0);
    });
  };
  setInterval(cb, MAGIC_NUMBER);
});
