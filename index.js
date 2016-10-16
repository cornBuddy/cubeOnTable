// TODO: fix segmentation fault error
const cv = require('opencv');
const filter = require('./imageProcessing').filter;
const findBiggestRectangle
  = require('./imageProcessing').findBiggestRectangle

const CAM_HEIGHT = 240;
const CAM_WIDTH = 320;
const MAGIC_NUMBER = 200;

function detectObjectsFromCamera(camera, window) {
  return function() {
    camera.read((err, rawImage) => {
      const filtered = filter(rawImage);
      const table = findBiggestRectangle(filtered);
      if (table === null)
        console.log('there is no rectangle');
      else
        rawImage.rectangle([table.x, table.y], [table.width, table.height]);
      window.show(rawImage);
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
