#!/usr/bin/env node
const path = require('path');
const cv = require('opencv');

const POSITIVE_VIDEO = path.join(__dirname, 'positive.3gp');
const POSITIVE_OUTPUT = path.join(__dirname, 'positive/');
const NEGATIVE_VIDEO = path.join(__dirname, 'negative.3gp');
const NEGATIVE_OUTPUT = path.join(__dirname, 'negative/');

function extractImages(pathToVideo, outputDir, offset=5) {
  const video = new cv.VideoCapture(pathToVideo);
  let i = 0;
  const iter = function() {
    video.read((err, mat) => {
      if (err) throw err;
      i++;
      if (i % offset === 0) {
        mat.save(path.join(outputDir, `img_${i}.jpg`));
        console.log(path.join(outputDir, `img_${i}.jpg`));
      }
      iter();
    });
  };
  iter();
}

extractImages(POSITIVE_VIDEO, POSITIVE_OUTPUT);
extractImages(NEGATIVE_VIDEO, NEGATIVE_OUTPUT, 3);
