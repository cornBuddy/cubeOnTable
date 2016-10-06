const cv = require('opencv');

const CASCADE = './node_modules/opencv/data/haarcascade_frontalface_alt2.xml';
const CAM_HEIGHT = 240;
const CAM_WIDTH = 320;
const CAM_FPS = 10;
const CAM_INTERVAL = 1000 / CAM_FPS;

function detectObjectsFromCamera(camera, window) {
  return function() {
    camera.read((err, im) => {
      if (err) throw err;
      im.detectObject(CASCADE, {}, (err, objects) => {
        if (err) throw err;
        for (let i = 0; i < objects.length; i++) {
          const obj = objects[i];
          console.log(`obj[${i}] = ${obj}`);
          im.rectangle([obj.x, obj.y], [obj.width, obj.height]);
        }
        window.show(im);
        window.blockingWaitKey(0, CAM_FPS);
      });
    });
  }
}

try {
  const window = new cv.NamedWindow('Video', 0);
  const camera = new cv.VideoCapture(0);
  camera.setWidth(CAM_WIDTH);
  camera.setHeight(CAM_HEIGHT);
  setInterval(detectObjectsFromCamera(camera, window), CAM_INTERVAL);
} catch (e){
  console.log("Couldn't start camera:", e)
}
