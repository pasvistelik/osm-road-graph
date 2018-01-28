'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _point = require('./point');

var _point2 = _interopRequireDefault(_point);

var _geoCoordsDistance = require('geo-coords-distance');

var _geoCoordsDistance2 = _interopRequireDefault(_geoCoordsDistance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Points = function () {
    function Points(fromNode, toNode) {
        (0, _classCallCheck3.default)(this, Points);

        this.collection = [];

        this.finalPointCoords = {
            lat: toNode.lat,
            lng: toNode.lng
        };

        this.startPoint = new _point2.default(fromNode, 0, (0, _geoCoordsDistance2.default)(fromNode, this.finalPointCoords));
        this.finalPoint = new _point2.default(toNode, 2160000000, 0);

        this.currentSelectedPoint = null;

        this.collection.push(this.startPoint);
        this.collection.push(this.finalPoint);
    }

    (0, _createClass3.default)(Points, [{
        key: 'findElement',
        value: function findElement(node) {
            if (node.point != null) return node.point;
            var newCreatedPoint = new _point2.default(node, 2160000000, (0, _geoCoordsDistance2.default)(node, this.finalPointCoords));
            this.collection.push(newCreatedPoint);
            return newCreatedPoint;
        }
    }, {
        key: 'getNextUnvisitedPoint',
        value: function getNextUnvisitedPoint() {
            if (this.currentSelectedPoint != null) this.currentSelectedPoint.setVisited();
            this.currentSelectedPoint = this.selectPointWithMinimalMark();
            return this.currentSelectedPoint;
        }
    }, {
        key: 'selectPointWithMinimalMark',
        value: function selectPointWithMinimalMark() {
            for (var i = 0, n = this.collection.length, t = this.collection[0], p = null, currentMarkValue; i < n; t = this.collection[++i]) {
                if (!t.isVisited) {
                    p = t;
                    currentMarkValue = p.totalDistance + p.heuristicDistanceToFinalPoint;
                    for (t = this.collection[++i]; i < n; t = this.collection[++i]) {
                        if (!t.isVisited && t.totalDistance + t.heuristicDistanceToFinalPoint < currentMarkValue) {
                            p = t;
                            currentMarkValue = p.totalDistance + p.heuristicDistanceToFinalPoint;
                        }
                    }
                    return p;
                }
            }
            return null;
        }
    }, {
        key: 'countShortestWay',
        value: function countShortestWay() {
            var counter = 1;
            for (var selectedPoint = this.getNextUnvisitedPoint(), selectedPointNode, selectedPointTotalDistance, nodesOfNode; selectedPoint != null; selectedPoint = this.getNextUnvisitedPoint()) {
                counter++;
                selectedPointTotalDistance = selectedPoint.totalDistance;
                selectedPointNode = selectedPoint.node;
                nodesOfNode = selectedPointNode.next_nodes;

                //console.log(selectedPointNode.id);//

                // Завершаем поиск, если значение метки превышает минимальное найденное расстояние до пункта назначения:
                if (selectedPointTotalDistance + selectedPoint.heuristicDistanceToFinalPoint > this.finalPoint.totalDistance) {
                    console.log("Breaked.");
                    break;
                }

                // Просматриваем все возможные дальнейшие шаги из текушей вершины:
                for (var i = 0, n = nodesOfNode.length, nextNodeObj = nodesOfNode[0]; i < n; nextNodeObj = nodesOfNode[++i]) {

                    //console.log("[" + selectedPointNode.id + " to " + nextNodeObj.node.id + "]: " + nextNodeObj.distance);

                    var nextPoint = this.findElement(nextNodeObj.node);
                    //let oldDistance = nextPoint.totalDistance;
                    if (nextPoint.tryUpdate(selectedPointTotalDistance + nextNodeObj.distance, selectedPoint)) {
                        /*if(nextPoint == this.finalPoint) {
                            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                              console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                              console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                        }
                        console.log(oldDistance + " changed to (" + selectedPointTotalDistance + " + " + nextNodeObj.distance + ") = " + nextPoint.totalDistance);*/
                    }
                }
            }

            _point2.default.clearNodes(); // delete ".point" from all used nodes
            console.log("All: " + counter);
        }
    }]);
    return Points;
}();

exports.default = Points;