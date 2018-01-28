'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _initialize = require('../lib/initialize');

var _initialize2 = _interopRequireDefault(_initialize);

var _geoCoordsDistance = require('geo-coords-distance');

var _geoCoordsDistance2 = _interopRequireDefault(_geoCoordsDistance);

var _points = require('./dijkstra/points');

var _points2 = _interopRequireDefault(_points);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RoadGraph = function () {
    function RoadGraph(ways, nodes) {
        (0, _classCallCheck3.default)(this, RoadGraph);

        this.ways = ways;
        this.nodes = nodes;
    }

    (0, _createClass3.default)(RoadGraph, [{
        key: 'findShortestWay',
        value: function findShortestWay(startNode, finalNode) {

            var startSortingMoment = Date.now();

            var points = new _points2.default(startNode, finalNode);
            points.countShortestWay();

            console.log("TEST 1. Time = " + (Date.now() - startSortingMoment) + " ms.");

            var tmp_str = "";
            var counter = 0;
            var coordsList = [];
            for (var currentPoint = points.finalPoint; currentPoint != null;) {
                tmp_str += currentPoint.node.id + "(" + currentPoint.totalDistance + ")" + " < < < ";
                coordsList.push({
                    lat: currentPoint.node.lat,
                    lng: currentPoint.node.lng
                });

                currentPoint = currentPoint.previousPoint;
                counter++;
            }
            //console.log(tmp_str);
            console.log("NODES: " + counter);
            console.log(JSON.stringify(coordsList));
        }
    }, {
        key: 'getNodesAround',
        value: function getNodesAround(coords, radius) {
            var result = [];
            for (var i = 0, num_of_nodes = this.nodes.length, node = this.nodes[0]; i < num_of_nodes; node = this.nodes[++i]) {
                if ((0, _geoCoordsDistance2.default)(coords, node /*{lat: node.lat, lng: node.lon}*/) < radius) {
                    result.push(node);
                }
            }
            return result;
        }
    }], [{
        key: 'fromOsmGraph',
        value: function fromOsmGraph(osm_graph_elements) {
            var result = (0, _initialize2.default)(osm_graph_elements);
            return new RoadGraph(result.ways, result.nodes);
        }
    }]);
    return RoadGraph;
}();

exports.default = RoadGraph;