'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GraphTypes = exports.RoadGraph = undefined;

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _initialize = require('../lib/initialize');

var _initialize2 = _interopRequireDefault(_initialize);

var _geoCoordsDistance = require('geo-coords-distance');

var _geoCoordsDistance2 = _interopRequireDefault(_geoCoordsDistance);

var _points = require('./dijkstra/points');

var _points2 = _interopRequireDefault(_points);

var _makeDistanceMatrix = require('./makeDistanceMatrix');

var _makeDistanceMatrix2 = _interopRequireDefault(_makeDistanceMatrix);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ResultObj = function ResultObj(node, distance) {
    (0, _classCallCheck3.default)(this, ResultObj);

    this.node = node;
    this.distance = distance;
};

function bindToLineSegment(fromCoords, lineStartNode, lineEndNode) {
    var distanceToLineStart = ~~(0, _geoCoordsDistance2.default)(fromCoords, lineStartNode);
    var distanceToLineEnd = ~~(0, _geoCoordsDistance2.default)(fromCoords, lineEndNode);
    var lineLength = ~~(0, _geoCoordsDistance2.default)(lineStartNode, lineEndNode);

    if (lineLength ** 2 < Math.abs(distanceToLineStart ** 2 - distanceToLineEnd ** 2)) {
        if (distanceToLineStart < distanceToLineEnd) return new ResultObj(lineStartNode, distanceToLineStart);
        return new ResultObj(lineEndNode, distanceToLineEnd);
    }

    var p = (distanceToLineStart + distanceToLineEnd + lineLength) / 2;
    var h = 2 * Math.sqrt(p * (p - distanceToLineStart) * (p - distanceToLineEnd) * (p - lineLength)) / lineLength;

    var tmp = Math.sqrt(distanceToLineStart ** 2 - h ** 2);
    var lat = lineEndNode.lat + (lineLength - tmp) * (lineStartNode.lat - lineEndNode.lat) / lineLength;
    var lng = lineEndNode.lng + (lineLength - tmp) * (lineStartNode.lng - lineEndNode.lng) / lineLength;

    var next_nodes = [];
    var previous_nodes = [];
    next_nodes.push(new ResultObj(lineEndNode, distanceToLineEnd));
    previous_nodes.push(new ResultObj(lineStartNode, distanceToLineStart));
    if (tmp < 5) {
        next_nodes.push(new ResultObj(lineStartNode, distanceToLineStart));
        previous_nodes.push(new ResultObj(lineEndNode, distanceToLineEnd));
    } else {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = lineEndNode.next_nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var node_obj = _step.value;

                if (node_obj.node == lineStartNode) {
                    next_nodes.push(new ResultObj(lineStartNode, distanceToLineStart));
                    previous_nodes.push(new ResultObj(lineEndNode, distanceToLineEnd));
                    break;
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
    var newNode = { lat: lat, lng: lng, next_nodes: next_nodes, previous_nodes: previous_nodes };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //lineStartNode.next_nodes.push(new ResultObj(newNode, Math.sqrt(distanceToLineStart*distanceToLineStart - h*h)));
    //lineEndNode.next_nodes.push(new ResultObj(newNode, Math.sqrt(distanceToLineEnd*distanceToLineEnd - h*h)));

    //console.log("next_nodes", next_nodes);

    return new ResultObj(newNode, h);
}

var GraphTypes = {
    pedestrian: 0,
    car: 1,
    emergency: 2
};

var RoadGraph = function () {
    function RoadGraph(ways, nodes, type) {
        (0, _classCallCheck3.default)(this, RoadGraph);

        this.ways = ways;
        this.nodes = nodes;
        this.graphType = type;
        this.makeDistanceMatrix = _makeDistanceMatrix2.default;
    }

    (0, _createClass3.default)(RoadGraph, [{
        key: 'findShortestWayByCoords',
        value: function findShortestWayByCoords(fromCoords, toCoords) {
            /*let startNode, finalNode;
            if (this.graphType === GraphTypes.pedestrian) {
                startNode = createNodeWithRelationsToNearestNodes(fromCoords)//...
            }*/
            var nearestNode = this.getNearestPlace(fromCoords); //this.getNearestNode(fromCoords);
            var nearestNodeTo = this.getNearestPlace(toCoords); ////////////////////////////////////////////////////////////////////////////////////////
            //let nearestNodeTo = this.getNearestNode(toCoords);
            //console.log(nearestNodeTo);
            var result = this.findShortestWay(nearestNode, nearestNodeTo);

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
            var points = new _points2.default(startNode, finalNode);
            points.countShortestWay();

            var coordsList = [];
            for (var currentPoint = points.finalPoint; currentPoint != null; currentPoint = currentPoint.previousPoint) {
                coordsList.push({
                    lat: currentPoint.node.lat,
                    lng: currentPoint.node.lng
                });
            }
            return {
                distance: ~~points.finalPoint.totalDistance,
                polyline: coordsList.reverse()
            };
        }
    }, {
        key: 'getNodesAround',
        value: function getNodesAround(coords, radius) {
            return this.nodes.filter(function (node) {
                return (0, _geoCoordsDistance2.default)(coords, node) < radius;
            });
        }
    }, {
        key: 'getNearestNode',
        value: function getNearestNode(coords) {
            var result = null;
            var minDistance = Infinity;
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
            var minDistance = Infinity;
            for (var _i = 0, count = candidatesNodes.length, item = candidatesNodes[0]; _i < count; item = candidatesNodes[++_i]) {
                if (item.distance < minDistance) {
                    minDistance = item.distance;
                    result = item.node;
                }
            }

            if (result.previous_nodes) {
                for (var _i2 = 0, n = result.previous_nodes.length, node_obj = result.previous_nodes[0]; _i2 < n; node_obj = result.previous_nodes[++_i2]) {
                    node_obj.node.next_nodes.push({ node: result, distance: node_obj.distance }); //!!!!!!!!!!!! delete this node after using!!!!!!!!!
                }
            }

            return result;
        }
    }], [{
        key: 'fromOsmGraph',
        value: function fromOsmGraph(osm_graph_elements, type) {
            var result = (0, _initialize2.default)(osm_graph_elements, type);
            return new RoadGraph(result.ways, result.nodes, type);
        }
    }]);
    return RoadGraph;
}();

RoadGraph.GraphTypes = GraphTypes;
exports.RoadGraph = RoadGraph;
exports.GraphTypes = GraphTypes;
exports.default = RoadGraph;