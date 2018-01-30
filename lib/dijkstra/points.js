'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _heap = require('heap');

var _heap2 = _interopRequireDefault(_heap);

var _point = require('./point');

var _point2 = _interopRequireDefault(_point);

var _geoCoordsDistance = require('geo-coords-distance');

var _geoCoordsDistance2 = _interopRequireDefault(_geoCoordsDistance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function comparePointsFunction(a, b) {
    return a.totalDistance + a.heuristicDistanceToFinalPoint - (b.totalDistance + b.heuristicDistanceToFinalPoint);
}

var Points = function () {
    function Points(fromNode, toNode) {
        (0, _classCallCheck3.default)(this, Points);

        this.collection = new _heap2.default(comparePointsFunction);

        this.finalPointCoords = {
            lat: toNode.lat,
            lng: toNode.lng
        };

        this.startPoint = new _point2.default(fromNode, 0, (0, _geoCoordsDistance2.default)(fromNode, this.finalPointCoords));
        this.finalPoint = new _point2.default(toNode, 2160000000, 0);

        this.currentSelectedPoint = null;

        this.collection.push(this.startPoint);
        //this.collection.push(this.finalPoint);
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

            this.currentSelectedPoint = this.collection.pop();
            return this.currentSelectedPoint;
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
                    if (nextPoint.tryUpdate(_selectedPointTotalDistance + nextNodeObj.distance, selectedPoint)) {
                        this.collection.updateItem(nextPoint);
                    }
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