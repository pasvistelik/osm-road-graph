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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RoadGraph = function () {
    function RoadGraph(ways, nodes) {
        (0, _classCallCheck3.default)(this, RoadGraph);

        this.ways = ways;
        this.nodes = nodes;
    }

    (0, _createClass3.default)(RoadGraph, [{
        key: 'findShortestWay',
        value: function findShortestWay(startNode, FinalNode) {
            var unvisited_nodes = [];
            var visited_nodes = [];
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