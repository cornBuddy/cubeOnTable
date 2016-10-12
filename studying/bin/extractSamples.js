#!/usr/bin/env node
const path = require('path');
const cv = require('opencv');
const inspect = require('util').inspect;
const parseArgs = require('minimist');

const POSITIVE_VIDEO = path.join(__dirname, '..', 'positive.3gp');
const POSITIVE_OUTPUT = path.join(__dirname, '..', 'positive/');
const NEGATIVE_VIDEO = path.join(__dirname, '..', 'negative.3gp');
const NEGATIVE_OUTPUT = path.join(__dirname, '..', 'negative/');

function extractImages(pathToVideo, outputDir) {
  const video = new cv.VideoCapture(pathToVideo);
  let i = 0;
  const iter = function() {
    video.read((err, mat) => {
      i++;
      if (video.getFrameCount() < i)
        return;
      mat.save(path.join(outputDir, `img_${i}.jpg`));
      iter();
    });
  };
  iter();
}

