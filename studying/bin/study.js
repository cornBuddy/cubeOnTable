#!/usr/bin/env node
const exec = require('child_process').execSync;

const MAX_Z_ANGLE = 1,5708;
const MAX_Y_ANGLE = 1,5708;
const MAX_X_ANGLE = 1,5708;

const POSITIVE_SAMPLES_COUNT = 20000;
const WIDTH = 160;
const HEIGTH = 80;
const BUF_SIZE = 1024;
const NUM_STAGES = 20;
const MIN_HIT_RATE = 0.999;
const CLASSIFIER_DIR = 'lbp-classifier';
const FEATURE_TYPE = 'LBP';
const FALSE_ALARM_RATE = 0.4;

exec('find ./negative/ -name "*.jpg" > negative.dat');
exec('find ./positive/ -name "*.jpg" > positive.dat');
exec(`perl bin/createsamples.pl positive.dat negative.dat samples`
  + ` ${POSITIVE_SAMPLES_COUNT}`
  + ` "opencv_createsamples -bgcolor 0 -bgthresh 0`
  + ` -maxxangle ${MAX_X_ANGLE}`
  + ` -maxyangle ${MAX_Y_ANGLE}`
  + ` -maxzangle ${MAX_Z_ANGLE}`
  + ` -maxidev 40 -w ${WIDTH} -h ${HEIGTH}"`
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
