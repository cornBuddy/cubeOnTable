const cv = require('opencv');

const transformImage = require('./imageProcessing').transformImage;
const crop = require('./imageProcessing').crop;
const findBiggestRectangle
  = require('./imageProcessing').findBiggestRectangle;

// TODO: fix segmentation fault error

// 1 find table on image
// 2 crop image; cropped part should contain only table and few pixels around it
// 3 filter image; find contours of image using canny algorithm
// 4 on cropped part find the biggest rectangle
// 5 draw cube on it
//  how should it find table on uncropped image?

const CAM_HEIGHT = 180;
const CAM_WIDTH = 320;
const MAGIC_NUMBER = 200;

function detectObjectsFromCamera(camera, window, cascade) {
  return function() {
    camera.read((err, rawImage) => {
      if (err) throw err;
      rawImage.detectObject(cascade, {}, (err, objects) => {
        if (err) throw err;
        const obj = objects[0];
        if (obj) {
          const cropped = crop(rawImage, obj);
          const filtered = transformImage(cropped);
          const rectangle = findBiggestRectangle(filtered);
          window.show(filtered);
        }
        else
          console.log('there are no objects');
        if (window.blockingWaitKey(0, MAGIC_NUMBER) === 27)
          process.exit(0);
      });
    });
  }
}

try {
  const window = new cv.NamedWindow('Video', cv.WINDOW_AUTOSIZE);
  const camera = new cv.VideoCapture(0);
  camera.setWidth(CAM_WIDTH);
  camera.setHeight(CAM_HEIGHT);
  const cb = detectObjectsFromCamera(camera, window, cv.FACE_CASCADE);
  setInterval(cb, MAGIC_NUMBER);
} catch (e){
  console.log("Couldn't start camera:", e)
}
