'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _geoCoordsDistance = require('geo-coords-distance');

var _geoCoordsDistance2 = _interopRequireDefault(_geoCoordsDistance);

var _roadGraph = require('./roadGraph');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeDistanceMatrix(points) {
    var gettingCoordsFunc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var distanceLimit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;
    var gettingPointIdentificatorFunc = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var updatingPointFunc = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

    var distanceMatrix = [];
    if (!gettingCoordsFunc) gettingCoordsFunc = function gettingCoordsFunc(p) {
        return { lat: p.lat, lng: p.lng };
    };
    if (!gettingPointIdentificatorFunc) gettingPointIdentificatorFunc = function gettingPointIdentificatorFunc(p) {
        return p;
    };
    if (!updatingPointFunc) updatingPointFunc = function updatingPointFunc(currentPoint, otherPoint, distance) {};
    var isDistancesBijective = this.graphType !== _roadGraph.GraphTypes.car;
    var f = isDistancesBijective ? function (i) {
        return i + 1;
    } : function (i) {
        return 0;
    };
    for (var i = 0, n = points.length, startPoint = points[0], startPointCoords, heuristicDistance; i < n; startPoint = points[++i]) {
        startPointCoords = gettingCoordsFunc(startPoint);
        var startPointKey = gettingPointIdentificatorFunc(startPoint);
        if (!distanceMatrix[startPointKey]) distanceMatrix[startPointKey] = [];
        for (var j = f(i), finalPoint = points[j], finalPointCoords; j < n; finalPoint = points[++j]) {
            if (i === j) continue;
            finalPointCoords = gettingCoordsFunc(finalPoint);
            var finalPointKey = gettingPointIdentificatorFunc(finalPoint);

            heuristicDistance = (0, _geoCoordsDistance2.default)(startPointCoords, finalPointCoords);
            if (heuristicDistance >= distanceLimit) continue;

            var realDistance = this.findShortestWayByCoords(startPointCoords, finalPointCoords).distance;
            if (realDistance >= distanceLimit) continue;

            distanceMatrix[startPointKey].push({ key: finalPointKey, distance: realDistance });
            updatingPointFunc(startPoint, finalPoint, realDistance);

            if (isDistancesBijective) {
                if (!distanceMatrix[finalPointKey]) distanceMatrix[finalPointKey] = [];
                distanceMatrix[finalPointKey].push({ key: startPointKey, distance: realDistance });
                updatingPointFunc(finalPoint, startPoint, realDistance);
            }
        }
    }
    return distanceMatrix;
}

exports.default = makeDistanceMatrix;