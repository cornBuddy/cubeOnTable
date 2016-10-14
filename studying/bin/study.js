#!/usr/bin/env node
const exec = require('child_process').execSync;

const POSITIVE_SAMPLES_COUNT = 7000;
const WIDTH = 48;
const HEIGTH = 24;
const BUF_SIZE = 512;
const NUM_STAGES = 5;
const MIN_HIT_RATE = 0.999;
const CLASSIFIER_DIR = 'lbp-classifier';
const FEATURE_TYPE = 'LBP';
const FALSE_ALARM_RATE = 0.5;

exec('find ./negative/ -name "*.jpg" > negative.dat');
exec('find ./positive/ -name "*.jpg" > positive.dat');
exec(`perl bin/createsamples.pl positive.dat negative.dat samples`
  + ` ${POSITIVE_SAMPLES_COUNT}`
  + ` "opencv_createsamples -bgcolor 0 -bgthresh 0 -maxxangle 1.1`
  + ` -maxyangle 1.1 maxzangle 0.5 -maxidev 40 -w ${WIDTH} -h ${HEIGTH}"`
  + ` 2> samples.err.log 1> samples.log`);
exec('python tools/mergevec.py -v samples/ -o samples.vec');
const numNeg = parseInt(exec('ls negative/ | wc -l'));
const numPos = Math.floor(
  (POSITIVE_SAMPLES_COUNT - numNeg)
  / (1 + (NUM_STAGES - 1) * (1 - MIN_HIT_RATE)));
exec(`opencv_traincascade -data ${CLASSIFIER_DIR} -vec samples.vec`
  + ` -bg negative.dat -numStages ${NUM_STAGES} -minHitRate ${MIN_HIT_RATE}`
  + ` -maxFalseAlarmRate ${FALSE_ALARM_RATE}}`
  + ` -numPos ${numPos} -numNeg ${numNeg}`
  + ` -w ${WIDTH} -h ${HEIGTH} -mode ALL`
  + ` -precalcValBufSize ${BUF_SIZE} -precalcIdxBufSize ${BUF_SIZE}`
  + ` -featureType ${FEATURE_TYPE}`
  + ` 2> study.err.log 1> study.log`);
