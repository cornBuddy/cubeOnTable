// TODO: fix segmentation fault error

// 1 find table on image
// 2 crop image; cropped part should contain only table and few pixels around it
// 3 filter image; find contours of image using canny algorithm
// 4 on cropped part find the biggest rectangle
// 5 draw cube on it
//  how should it find table on uncropped image?

const cv = require('opencv');

const CAM_HEIGHT = 180;
const CAM_WIDTH = 320;
const MAGIC_NUMBER = 200;

function transformImage(image) {
  const copy = image.clone();
  copy.convertGrayscale();
  copy.medianBlur(5);
  return copy;
}

function crop(image, object) {
  const minus10perc = (n) => (Math.floor(n - n * 0.1));
  const plus20perc = (n) => (Math.floor(n + n * 0.2));
  const croppedX = minus10perc(object.x) >= 0
    ? minus10perc(object.x)
    : 0;
  const croppedY = minus10perc(object.y) >= 0
    ? minus10perc(object.y)
    : 0;
  const croppedHeight = plus20perc(object.height);
  const croppedWidth = plus20perc(object.width);
  return image.crop(croppedX, croppedY, croppedHeight, croppedWidth);
}

function detectObjectsFromCamera(camera, window) {
  return function() {
    camera.read((err, im) => {
      if (err) throw err;
      let transformed = transformImage(im);
      transformed.detectObject(cv.FACE_CASCADE, {}, (err, objects) => {
        if (err) throw err;
        const face = objects[0];
        if (face) {
          transformed.rectangle([face.x, face.y], [face.width, face.height]);
          transformed = crop(transformed, face);
        }
        else
          console.log('there are no faces');
        window.show(transformed);
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
  setInterval(detectObjectsFromCamera(camera, window), MAGIC_NUMBER);
} catch (e){
  console.log("Couldn't start camera:", e)
}
