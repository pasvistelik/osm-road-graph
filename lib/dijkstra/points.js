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
            if (node.point) return node.point;
            var newCreatedPoint = new _point2.default(node, 2160000000, (0, _geoCoordsDistance2.default)(node, this.finalPointCoords));
            this.collection.push(newCreatedPoint);
            return newCreatedPoint;
        }
    }, {
        key: 'getNextUnvisitedPoint',
        value: function getNextUnvisitedPoint() {
            if (this.currentSelectedPoint != null) this.currentSelectedPoint.setVisited();
            if (this.currentSelectedPoint == this.finalPoint) return null; // stop if final point was visited
            this.currentSelectedPoint = this.selectPointWithMinimalMark();
            return this.currentSelectedPoint;
        }
    }, {
        key: 'selectPointWithMinimalMark',
        value: function selectPointWithMinimalMark() {
            // ToDo: need to use better data structure...
            for (var i = 0, collection = this.collection, n = collection.length, t = collection[0], p = null, currentMarkValue; i < n; t = collection[++i]) {
                if (!t.isVisited) {
                    p = t;
                    currentMarkValue = p.totalDistance + p.heuristicDistanceToFinalPoint;
                    for (t = collection[++i]; i < n; t = collection[++i]) {
                        var dist = t.totalDistance + t.heuristicDistanceToFinalPoint;
                        if (!t.isVisited && dist < currentMarkValue) {
                            p = t;
                            currentMarkValue = dist;
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
            var _this = this;

            var counter = 1;

            var _loop = function _loop(selectedPoint, _selectedPointNode, _selectedPointTotalDistance, _nodesOfNode) {

                //console.log(counter, selectedPoint);
                counter++;
                _selectedPointTotalDistance = selectedPoint.totalDistance;
                _selectedPointNode = selectedPoint.node;
                _nodesOfNode = _selectedPointNode.next_nodes;

                // Завершаем поиск, если значение метки превышает минимальное найденное расстояние до пункта назначения:
                if (_selectedPointTotalDistance + selectedPoint.heuristicDistanceToFinalPoint > _this.finalPoint.totalDistance) {
                    console.log("Breaked.");
                    return 'break';
                }

                // Просматриваем все возможные дальнейшие шаги из текушей вершины:
                _nodesOfNode.forEach(function (nextNodeObj) {
                    var nextPoint = this.findElement(nextNodeObj.node);
                    nextPoint.tryUpdate(_selectedPointTotalDistance + nextNodeObj.distance, selectedPoint);
                }, _this);

                selectedPointNode = _selectedPointNode;
                selectedPointTotalDistance = _selectedPointTotalDistance;
                nodesOfNode = _nodesOfNode;
            };

            for (var selectedPoint = this.startPoint, selectedPointNode, selectedPointTotalDistance, nodesOfNode; selectedPoint != null; selectedPoint = this.getNextUnvisitedPoint()) {
                var _ret = _loop(selectedPoint, selectedPointNode, selectedPointTotalDistance, nodesOfNode);

                if (_ret === 'break') break;
            }

            _point2.default.clearNodes(); // delete ".point" from all used nodes
            console.log("All: " + counter);
        }
    }]);
    return Points;
}();

exports.default = Points;