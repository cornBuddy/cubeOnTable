const cv = require('opencv');

const crop = require('./imageProcessing').crop;

// TODO: fix segmentation fault error

// 1 find table on image
// 2 crop image; cropped part should contain only table and few pixels around it
// 3 filter image; find contours of image using canny algorithm
// 4 on cropped part find the biggest rectangle
// 5 draw cube on it
//  how should it find table on uncropped image?
//  do i really need to crop image?

const CAM_HEIGHT = 180;
const CAM_WIDTH = 320;
const MAGIC_NUMBER = 200;
const TABLE_CASCADE = './studying/lbp-classifier/cascade.xml'

function cropTableAndShow(rawImage, window) {
  const cb = (err, objects) => {
    if (err) throw err;
    for (const obj of objects) {
      rawImage.rectangle([obj.x, obj.y], [obj.height, obj.width]);
      console.log(`(${obj.x}, ${obj.y}); h=${obj.height}, w=${obj.width}`);
    }
    window.show(rawImage);
    if (window.blockingWaitKey(0, MAGIC_NUMBER) === 27)
      process.exit(0);
  };
  rawImage.detectObject(TABLE_CASCADE, {}, cb);
}

function detectTableFromCamera(camera, window) {
  return function () {
    camera.read((err, rawImage) => {
      if (err) throw err;
      cropTableAndShow(rawImage, window);
    });
  }
}

try {
  const window = new cv.NamedWindow('Video', cv.WINDOW_AUTOSIZE);
  const camera = new cv.VideoCapture(0);
  camera.setWidth(CAM_WIDTH);
  camera.setHeight(CAM_HEIGHT);
  const cb = detectTableFromCamera(camera, window);
  setInterval(cb, MAGIC_NUMBER);
} catch (e){
  console.log("Couldn't start camera:", e)
}
