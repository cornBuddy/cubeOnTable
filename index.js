// TODO: fix segmentation fault error
const cv = require('opencv');

const CAM_HEIGHT = 180;
const CAM_WIDTH = 320;
const MAGIC_NUMBER = 200;

function transformImage(image) {
  // TODO: correct copy image
  image.cvtColor('CV_YCrCb2BGR');
  image.cvtColor('CV_BGR2GRAY');
  image.medianBlur(5);
  return image;
}

function detectObjectsFromCamera(camera, window) {
  return function() {
    camera.read((err, im) => {
      if (err) throw err;
      const transformed = transformImage(im);
      transformed.detectObject(cv.FACE_CASCADE, {}, (err, objects) => {
        if (err) throw err;
        const face = objects[0];
        if (face)
          im.rectangle([face.x, face.y], [face.width, face.height]);
        else
          console.log('there are no faces');
        window.show(transformed);
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
