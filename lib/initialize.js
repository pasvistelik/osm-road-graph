'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _geoCoordsDistance = require('geo-coords-distance');

var _geoCoordsDistance2 = _interopRequireDefault(_geoCoordsDistance);

var _roadGraph = require('./roadGraph');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function binaryFind(array, predicateForArrayItem) {
    var i = 0,
        j = array.length,
        k = void 0,
        predicateResult = void 0,
        currentItem = void 0;
    while (i < j) {
        k = ~~((i + j) / 2);
        currentItem = array[k];
        predicateResult = predicateForArrayItem(currentItem, k, array);
        if (predicateResult === 0) return currentItem;else if (predicateResult === 1) j = k;else i = k + 1;
    }
    return null;
}
function getFindingNodeFunc(node_id) {
    return function (element) {
        var current_id = element.id;
        if (current_id > node_id) return 1;
        if (current_id < node_id) return -1;
        return 0;
    };
}
function compare_ids(a, b) {
    if (a.id > b.id) return 1;
    if (a.id < b.id) return -1;
    return 0;
}
function initialize(osm_graph_elements, type) {
    var ways = [];
    var nodes = [];
    var ways_index = 0;
    osm_graph_elements.forEach(function (item) {
        switch (item.type) {
            case "way":
                {
                    item.local_id = ways_index++;
                    ways.push(item);
                    break;
                }
            case "node":
                {
                    nodes.push(item);
                    break;
                }
            default:
                break;
        }
    });

    nodes.sort(compare_ids); // ToDo: use TimSort or others if it spend a long time... (nodes in OSM partially sorted)
    nodes.forEach(function (node, index) {
        node.local_id = index++;
        node.next_nodes = [];
        node.lng = node.lon;
        //delete node.lon;
        //node.previous_nodes = [];
    });

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = ways[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var way = _step.value;

            var is_oneway = way.tags.oneway == "yes" || way.tags.junction == "roundabout";
            for (var previous_dist, dist, i = 1, n = way.nodes.length + 1, previous_node = null, current_node = binaryFind(nodes, getFindingNodeFunc(way.nodes[0])), next_node = way.nodes[1] ? binaryFind(nodes, getFindingNodeFunc(way.nodes[1])) : null; i < n; previous_node = current_node, current_node = next_node, next_node = way.nodes[++i] ? binaryFind(nodes, getFindingNodeFunc(way.nodes[i])) : null) {
                if (next_node) {
                    dist = ~~(0, _geoCoordsDistance2.default)(current_node, next_node);
                    current_node.next_nodes.push({
                        node: next_node,
                        distance: dist
                    });
                    /*next_node.previous_nodes.push({
                        node: current_node,
                        distance: dist
                    });*/
                }
                // if road is not one-way only:
                if ((type === _roadGraph.GraphTypes.pedestrian || !is_oneway) && previous_node) {
                    //let dist = ~~distance(current_node, previous_node);
                    //let dist = ~~distance({lat: current_node.lat, lng: current_node.lon}, {lat: previous_node.lat, lng: previous_node.lon})
                    current_node.next_nodes.push({
                        node: previous_node,
                        distance: previous_dist //dist
                    });
                    /*previous_node.previous_nodes.push({
                        node: current_node,
                        distance: dist
                    });*/
                }
                previous_dist = dist;
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

    return { ways: ways, nodes: nodes };
}
exports.default = initialize;