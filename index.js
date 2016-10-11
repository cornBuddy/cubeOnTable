// TODO: fix segmentation fault error
const cv = require('opencv');

const CAM_HEIGHT = 240;
const CAM_WIDTH = 320;
const MAGIC_NUMBER = 200;

function detectObjectsFromCamera(camera, window) {
  return function() {
    camera.read((err, im) => {
      if (err) throw err;
      im.detectObject(cv.FACE_CASCADE, {}, (err, objects) => {
        if (err) throw err;
        for (let i = 0; i < objects.length; i++) {
          const obj = objects[i];
          console.log(`obj[${i}] = [${obj.x}, ${obj.y}]`);
          im.rectangle([obj.x, obj.y], [obj.width, obj.height]);
        }
        window.show(im);
        window.blockingWaitKey(0, MAGIC_NUMBER);
      });
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
