const findTrack = require('./search').findTrack;
const filter = require('./search').filter;
const getTrackedObject = require('./search').getTrackedObject;
const getRectPoints = require('./search').getRectPoints;
const findBiggestRectangleIndex
  = require('./search').findBiggestRectangleIndex

const drawAxis = require('./draw').drawAxis;

module.exports.drawAxis = drawAxis;
module.exports.findTrack = findTrack;
module.exports.filter = filter;
module.exports.getTrackedObject = getTrackedObject;
module.exports.getRectPoints = getRectPoints;
module.exports.findBiggestRectangleIndex = findBiggestRectangleIndex;
