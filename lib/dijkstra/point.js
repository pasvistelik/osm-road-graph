"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Point = function () {
    function Point(node, totalDistance, heuristicDistanceToFinalPoint) {
        (0, _classCallCheck3.default)(this, Point);

        this.node = node;
        node.point = this;
        this.totalDistance = totalDistance;
        this.heuristicDistanceToFinalPoint = heuristicDistanceToFinalPoint;
        this.markValue = totalDistance + heuristicDistanceToFinalPoint;
        this.isVisited = false;

        Point.usedNodes.push(node);
    }

    (0, _createClass3.default)(Point, [{
        key: "tryUpdate",
        value: function tryUpdate(newTotalDistance, previousPoint) {
            if (newTotalDistance < this.totalDistance) {
                this.previousPoint = previousPoint;
                this.totalDistance = newTotalDistance;
                this.markValue = newTotalDistance + this.heuristicDistanceToFinalPoint;
                return true;
            }
            return false;
        }
    }, {
        key: "setVisited",
        value: function setVisited() {
            this.isVisited = true;
        }
    }], [{
        key: "clearNodes",
        value: function clearNodes() {
            for (var i = 0, n = Point.usedNodes.length, node = Point.usedNodes[0]; i < n; node = Point.usedNodes[++i]) {
                delete node.point;
            }
            Point.usedNodes = [];
        }
    }]);
    return Point;
}();

Point.usedNodes = [];
exports.default = Point;