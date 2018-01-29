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

function bindToLineSegment(fromCoords, lineStartNode, lineEndNode) {
    var distanceToLineStart = (0, _geoCoordsDistance2.default)(fromCoords, lineStartNode);
    var distanceToLineEnd = (0, _geoCoordsDistance2.default)(fromCoords, lineEndNode);
    var lineLength = (0, _geoCoordsDistance2.default)(lineStartNode, lineEndNode);

    var ResultObj = function ResultObj(node, distance) {
        return { node: node, distance: distance };
    };

    if (lineLength * lineLength < Math.abs(distanceToLineStart * distanceToLineStart - distanceToLineEnd * distanceToLineEnd)) {
        if (distanceToLineStart < distanceToLineEnd) return ResultObj(lineStartNode, distanceToLineStart);
        return ResultObj(lineEndNode, distanceToLineEnd);
    }

    var p = (distanceToLineStart + distanceToLineEnd + lineLength) / 2;
    var h = 2 * Math.sqrt(p * (p - distanceToLineStart) * (p - distanceToLineEnd) * (p - lineLength)) / lineLength;

    var tmp = Math.sqrt(distanceToLineStart * distanceToLineStart - h * h);
    //console.log(tmp + " / " + lineLength);
    var lat = lineEndNode.lat + (lineLength - tmp) * (lineStartNode.lat - lineEndNode.lat) / lineLength;
    //console.log(lat + " from " + lineStartNode.lat + "and" + lineEndNode.lat);
    var lng = lineEndNode.lng + (lineLength - tmp) * (lineStartNode.lng - lineEndNode.lng) / lineLength;

    var next_nodes = [];
    //if (lineStartNode.next_nodes && lineStartNode.next_nodes.includes(lineEndNode)) 
    next_nodes.push(ResultObj(lineEndNode, distanceToLineEnd));
    next_nodes.push(ResultObj(lineStartNode, distanceToLineStart));
    //if (lineEndNode.next_nodes && lineEndNode.next_nodes.includes(lineStartNode)) next_nodes.push(lineStartNode);
    var newNode = { lat: lat, lng: lng, next_nodes: next_nodes };

    //console.log("next_nodes", next_nodes);

    return ResultObj(newNode, h);
}

var RoadGraph = function () {
    function RoadGraph(ways, nodes) {
        (0, _classCallCheck3.default)(this, RoadGraph);

        this.ways = ways;
        this.nodes = nodes;
    }

    (0, _createClass3.default)(RoadGraph, [{
        key: 'findShortestWayByCoords',
        value: function findShortestWayByCoords(fromCoords, toCoords) {
            var nearestNode = this.getNearestPlace(fromCoords); //this.getNearestNode(fromCoords);
            var result = this.findShortestWay(nearestNode, this.getNearestNode(toCoords));

            /*if (nearestNode.next_nodes.length > 0) {
                let tmpNode = nearestNode.next_nodes[0];
                let tmp = bindToLineSegment(fromCoords, nearestNode, tmpNode.node);
                //result.unshift({lat: tmp.node.lat, lng: tmp.node.lng});
                result[0] = {lat: tmp.node.lat, lng: tmp.node.lng};
                  console.log(tmp.node);
            }*/

            //console.log(result);

            return result;
        }
    }, {
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
            //console.log(JSON.stringify(coordsList));

            return coordsList.reverse();
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
    }, {
        key: 'getNearestNode',
        value: function getNearestNode(coords) {
            var result = null;
            var minDistance = 1000000000;
            for (var i = 0, num_of_nodes = this.nodes.length, node = this.nodes[0], dist; i < num_of_nodes; node = this.nodes[++i]) {
                dist = (0, _geoCoordsDistance2.default)(coords, node /*{lat: node.lat, lng: node.lon}*/);
                if (dist < minDistance) {
                    minDistance = dist;
                    result = node;
                }
            }
            return result;
        }
    }, {
        key: 'getNearestPlace',
        value: function getNearestPlace(coords) {
            var nearestNodes = this.getNodesAround(coords, 500); //...
            if (nearestNodes.length == 0) return this.getNearestNode(coords);

            var candidatesNodes = [];
            for (var i = 0, num_of_nodes = nearestNodes.length, node = nearestNodes[0]; i < num_of_nodes; node = nearestNodes[++i]) {
                for (var j = 0, count_of_next_nodes = node.next_nodes.length, next_node_obj = node.next_nodes[0], dist; j < count_of_next_nodes; next_node_obj = node.next_nodes[++j]) {
                    //console.log(node, next_node_obj.node);
                    candidatesNodes.push(bindToLineSegment(coords, node, next_node_obj.node));
                }
            }

            var result = null;
            var minDistance = 1000000000;
            for (var _i = 0, count = candidatesNodes.length, item = candidatesNodes[0]; _i < count; item = candidatesNodes[++_i]) {
                if (item.distance < minDistance) {
                    minDistance = item.distance;
                    result = item.node;
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