#!/usr/bin/env node
const path = require('path');
const cv = require('opencv');
const inspect = require('util').inspect;
const basename = require('path').basename
const parseArgs = require('minimist');

function extractImages(pathToVideo, outputDir, offset, prefix='img_') {
  offset = offset || 5;
  const video = new cv.VideoCapture(pathToVideo);
  const base = basename(pathToVideo);
  let i = 0;
  const iter = function() {
    video.read((err, mat) => {
      i++;
      if (video.getFrameCount() < i + offset)
        return;
      if (i % offset === 0) {
        const imgName = path.join(outputDir, `${prefix}${base}_${i}.jpg`);
        mat.save(imgName);
        console.log(`saved to ${imgName}`);
      }
      iter();
    });
  };
  iter();
}

const args = parseArgs(process.argv.slice(2));
if (!args.o || !args._)
  console.log('--o=path/to/output/dir/'
      + ' [--p=image_name_prefix] [--offset=int]'
      + ' files.ext to.ext extract.ext');

for (const video of args._)
  extractImages(video, args.o, args.offset, args.p);
