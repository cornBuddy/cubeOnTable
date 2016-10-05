bin/extractSamples.js
perl bin/createsamples.pl positive.dat negative.dat samples 700  "opencv_createsamples -bgcolor 0 -bgthresh 0 -maxxangle 1.1  -maxyangle 1.1 maxzangle 0.5 -maxidev 40 -w 24 -h 24" > samples.log
python tools/mergevec.py -v samples/ -o samples.vec
opencv_traincascade -data classifier -vec samples.vec -bg negative.dat -numStages 20 -minHitRate 0.9 -maxFalseAlarmRate 0.5 -numPos 400 -numNeg 5684 -w 24 -h 24 -mode ALL -precalcValBufSize 128 -precalcIdxBufSize 128 > study.log
touch done
