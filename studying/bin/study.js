const exec = require('child_process').execSync;

const POSITIVE_SAMPLES_COUNT = 6000;
const WIDTH = 24;
const HEIGTH = 24;
const BUF_SIZE = 1024;

exec('rm {positive,negative}/*');
exec('rm samples/*');
exec('bin/extractSamples.js');
exec('find ./negative/ -name "*.jpg" > negative.dat');
exec('find ./positive/ -name "*.jpg" > positive.dat');
exec(`perl bin/createsamples.pl positive.dat negative.dat samples`
  + ` ${POSITIVE_SAMPLES_COUNT}`
  + ` "opencv_createsamples -bgcolor 0 -bgthresh 0 -maxxangle 1.1`
  + ` -maxyangle 1.1 maxzangle 0.5 -maxidev 40 -w ${WIDTH} -h ${HEIGTH}"`
  + ` 2> samples.err.log 1> samples.log`);
exec('python tools/mergevec.py -v samples/ -o samples.vec');
const numNeg = parseInt(exec('ls negative/ | wc -l'));
exec(`opencv_traincascade -data classifier -vec samples.vec`
  + ` -bg negative.dat -numStages 20 -minHitRate 0.99 -maxFalseAlarmRate 0.5`
  + ` -numPos ${POSITIVE_SAMPLES_COUNT} -numNeg ${numNeg}`
  + ` -w ${WIDTH} -h ${HEIGHT} -mode ALL`
  + ` -precalcValBufSize ${BUF_SIZE} -precalcIdxBufSize ${BUF_SIZE}`
  + ` 2> study.err.log 1> study.log`);
