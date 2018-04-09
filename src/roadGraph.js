import initializeFromOsmGraph from '../lib/initialize';
import distance from 'geo-coords-distance';
import Points from './dijkstra/points';
import makeDistanceMatrix from './makeDistanceMatrix';

class ResultObj {
    constructor(node, distance) {
        this.node = node;
        this.distance = distance;
    }
}

function bindToLineSegment(fromCoords, lineStartNode, lineEndNode) {
    const distanceToLineStart = ~~distance(fromCoords, lineStartNode);
    const distanceToLineEnd = ~~distance(fromCoords, lineEndNode);
    const lineLength = ~~distance(lineStartNode, lineEndNode);

    if (lineLength ** 2 < Math.abs(distanceToLineStart ** 2 - distanceToLineEnd ** 2)) {
        if (distanceToLineStart < distanceToLineEnd) return new ResultObj(lineStartNode, distanceToLineStart);
        return new ResultObj(lineEndNode, distanceToLineEnd);
    }

    const p = (distanceToLineStart + distanceToLineEnd + lineLength) / 2;
    const h = 2 * Math.sqrt(p * (p - distanceToLineStart) * (p - distanceToLineEnd) * (p - lineLength)) / lineLength;

    const tmp = Math.sqrt(distanceToLineStart ** 2 - h ** 2);
    const lat = lineEndNode.lat + (lineLength - tmp) * (lineStartNode.lat - lineEndNode.lat) / lineLength;
    const lng = lineEndNode.lng + (lineLength - tmp) * (lineStartNode.lng - lineEndNode.lng) / lineLength;

    let next_nodes = [];
    let previous_nodes = [];
    next_nodes.push(new ResultObj(lineEndNode, distanceToLineEnd));
    previous_nodes.push(new ResultObj(lineStartNode, distanceToLineStart));
    if (tmp < 5) {
        next_nodes.push(new ResultObj(lineStartNode, distanceToLineStart));
        previous_nodes.push(new ResultObj(lineEndNode, distanceToLineEnd));
    }
    else {
        for (let node_obj of lineEndNode.next_nodes) {
            if (node_obj.node == lineStartNode) {
                next_nodes.push(new ResultObj(lineStartNode, distanceToLineStart));
                previous_nodes.push(new ResultObj(lineEndNode, distanceToLineEnd));
                break;
            }
        }
    }
    const newNode = {lat, lng, next_nodes, previous_nodes};

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //lineStartNode.next_nodes.push(new ResultObj(newNode, Math.sqrt(distanceToLineStart*distanceToLineStart - h*h)));
    //lineEndNode.next_nodes.push(new ResultObj(newNode, Math.sqrt(distanceToLineEnd*distanceToLineEnd - h*h)));

    //console.log("next_nodes", next_nodes);

    return new ResultObj(newNode, h);
}

const GraphTypes = {
    pedestrian: 0,
    car: 1,
    emergency: 2
}

class RoadGraph {
    static GraphTypes = GraphTypes;
    constructor(ways, nodes, type) {
        this.ways = ways;
        this.nodes = nodes;
        this.graphType = type;
        this.makeDistanceMatrix = makeDistanceMatrix;
    }
    static fromOsmGraph(osm_graph_elements, type){
        const result = initializeFromOsmGraph(osm_graph_elements, type);
        return new RoadGraph(result.ways, result.nodes, type);
    }

    findShortestWayByCoords(fromCoords, toCoords) {
        /*let startNode, finalNode;
        if (this.graphType === GraphTypes.pedestrian) {
            startNode = createNodeWithRelationsToNearestNodes(fromCoords)//...
        }*/
        let nearestNode = this.getNearestPlace(fromCoords); //this.getNearestNode(fromCoords);
        let nearestNodeTo = this.getNearestPlace(toCoords); ////////////////////////////////////////////////////////////////////////////////////////
        //let nearestNodeTo = this.getNearestNode(toCoords);
        //console.log(nearestNodeTo);
        let result = this.findShortestWay(nearestNode, nearestNodeTo);

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

    findShortestWay(startNode, finalNode) {
        let points = new Points(startNode, finalNode);
        points.countShortestWay();

        let coordsList = [];
        for (let currentPoint = points.finalPoint; currentPoint != null; currentPoint = currentPoint.previousPoint) {
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

    getNodesAround(coords, radius) {
        return this.nodes.filter(node => distance(coords, node) < radius);
    }
    getNearestNode(coords) {
        let result = null;
        let minDistance = Infinity;
        for (let i = 0, num_of_nodes = this.nodes.length, node = this.nodes[0], dist; i < num_of_nodes; node = this.nodes[++i]) {
            dist = distance(coords, node /*{lat: node.lat, lng: node.lon}*/);
            if (dist < minDistance) {
                minDistance = dist;
                result = node;
            }
        }
        return result;
    }
    getNearestPlace(coords) {
        let nearestNodes = this.getNodesAround(coords, 500);//...
        if (nearestNodes.length == 0) return this.getNearestNode(coords);

        let candidatesNodes = [];
        for (let i = 0, num_of_nodes = nearestNodes.length, node = nearestNodes[0]; i < num_of_nodes; node = nearestNodes[++i]) {
            for (let j = 0, count_of_next_nodes = node.next_nodes.length, next_node_obj = node.next_nodes[0], dist; j < count_of_next_nodes; next_node_obj = node.next_nodes[++j]) {
                //console.log(node, next_node_obj.node);
                candidatesNodes.push(bindToLineSegment(coords, node, next_node_obj.node));
            }
        }

        let result = null;
        let minDistance = Infinity;
        for (let i = 0, count = candidatesNodes.length, item = candidatesNodes[0]; i < count; item = candidatesNodes[++i]) {
            if (item.distance < minDistance) {
                minDistance = item.distance;
                result = item.node;
            }
        }

        if (result.previous_nodes) {
            for (let i = 0, n = result.previous_nodes.length, node_obj = result.previous_nodes[0]; i < n; node_obj = result.previous_nodes[++i]) {
                node_obj.node.next_nodes.push({node: result, distance: node_obj.distance}); //!!!!!!!!!!!! delete this node after using!!!!!!!!!
            }
        }

        return result;
    }
}

export {RoadGraph, GraphTypes};
export default RoadGraph;
