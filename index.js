const cv = require('opencv');

try {
  const camera = new cv.VideoCapture(0);
  const window = new cv.NamedWindow('Video', 0)
  setInterval(() => {
    camera.read((err, im) => {
      if (err) throw err;
      window.show(im);
      window.blockingWaitKey(0, 20);
    });
  }, 20);
} catch (e){
  console.log("Couldn't start camera:", e)
}
