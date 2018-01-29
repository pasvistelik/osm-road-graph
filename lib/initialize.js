"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _geoCoordsDistance = require("geo-coords-distance");

var _geoCoordsDistance2 = _interopRequireDefault(_geoCoordsDistance);

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
    return function (element, index, array) {
        var current_id = element.id;
        if (current_id > node_id) return 1;else if (current_id < node_id) return -1;
        return 0;
    };
}
function compare_ids(a, b) {
    if (a.id > b.id) return 1;
    if (a.id < b.id) return -1;
    return 0;
}
function initialize(osm_graph_elements) {

    var startMoment = Date.now();

    var ways = [];
    var nodes = [];
    var ways_index = 0;
    var nodes_index = 0;
    for (var i = 0, n = osm_graph_elements.length, item = osm_graph_elements[0]; i < n; item = osm_graph_elements[++i]) {
        //console.log(item,);
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
    }

    var startSortingMoment = Date.now();
    nodes.sort(compare_ids); // ToDo: use TimSort or others if it spend a long time... (nodes in OSM partially sorted)
    //console.log("Sorted. Time = " + (Date.now() - startSortingMoment) + " ms.");

    for (var _i = 0, _n = nodes.length, node = nodes[0]; _i < _n; node = nodes[++_i]) {
        node.local_id = nodes_index++;
        node.next_nodes = [];
        node.lng = node.lon;
        //delete node.lon;
        //node.previous_nodes = [];
    }
    //console.log("Nodes are modified. Time = " + (Date.now() - startSortingMoment) + " ms.");

    for (var j = 0, m = ways.length, way = ways[0]; j < m; way = ways[++j]) {
        var is_oneway = way.tags.oneway == "yes" || way.tags.junction == "roundabout";
        for (var previous_dist, dist, _i2 = 1, _n2 = way.nodes.length + 1, previous_node = null, current_node = binaryFind(nodes, getFindingNodeFunc(way.nodes[0])), next_node = way.nodes[1] ? binaryFind(nodes, getFindingNodeFunc(way.nodes[1])) : null; _i2 < _n2; previous_node = current_node, current_node = next_node, next_node = way.nodes[++_i2] ? binaryFind(nodes, getFindingNodeFunc(way.nodes[_i2])) : null) {

            if (next_node) {

                dist = ~~(0, _geoCoordsDistance2.default)(current_node, next_node);
                //let dist = ~~distance({lat: current_node.lat, lng: current_node.lon}, {lat: next_node.lat, lng: next_node.lon})
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
            if (!is_oneway && previous_node) {
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

    console.log("Initialized (" + nodes.length + " nodes). Time = " + (Date.now() - startMoment) + " ms.");

    return { ways: ways, nodes: nodes };
}

exports.default = initialize;