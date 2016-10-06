const cv = require('opencv');

const CASCADE = './node_modules/opencv/data/haarcascade_frontalface_alt.xml';

function detectObjectsFromCamera(camera, window) {
  return function() {
    camera.read((err, im) => {
      if (err) throw err;
      im.detectObject(CASCADE, {}, (err, objects) => {
        if (err) throw err;
        console.log(objects[0]);
        for (const obj of objects)
          im.rectangle([obj.x, obj.y], [obj.width, obj.height]);
        window.show(im);
        window.blockingWaitKey(0, 0);
      });
    });
  }
}

try {
  const camera = new cv.VideoCapture(0);
  const window = new cv.NamedWindow('Video', 0);
  setInterval(detectObjectsFromCamera(camera, window), 100);
} catch (e){
  console.log("Couldn't start camera:", e)
}
