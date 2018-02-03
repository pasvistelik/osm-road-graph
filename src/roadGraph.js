import initializeFromOsmGraph from '../lib/initialize';
import distance from 'geo-coords-distance';
import Points from './dijkstra/points';

function bindToLineSegment(fromCoords, lineStartNode, lineEndNode) {
    let distanceToLineStart = ~~distance(fromCoords, lineStartNode);
    let distanceToLineEnd = ~~distance(fromCoords, lineEndNode);
    let lineLength = ~~distance(lineStartNode, lineEndNode);

    let ResultObj = (node, distance) => { return {node, distance} };

    if (lineLength*lineLength < Math.abs(distanceToLineStart*distanceToLineStart - distanceToLineEnd*distanceToLineEnd)) {
        if (distanceToLineStart < distanceToLineEnd) return ResultObj(lineStartNode, distanceToLineStart);
        return ResultObj(lineEndNode, distanceToLineEnd);
    }
    
    let p = (distanceToLineStart + distanceToLineEnd + lineLength) / 2;
    let h = 2 * Math.sqrt(p * (p - distanceToLineStart) * (p - distanceToLineEnd) * (p - lineLength)) / lineLength;
    
    let tmp = Math.sqrt(distanceToLineStart*distanceToLineStart - h*h);
    let lat = lineEndNode.lat + (lineLength - tmp) * (lineStartNode.lat - lineEndNode.lat) / lineLength;
    let lng = lineEndNode.lng + (lineLength - tmp) * (lineStartNode.lng - lineEndNode.lng) / lineLength;
    
    let next_nodes = []; 
    let previous_nodes = []; 
    next_nodes.push(ResultObj(lineEndNode, distanceToLineEnd));
    previous_nodes.push(ResultObj(lineStartNode, distanceToLineStart));
    if (Math.sqrt(distanceToLineStart*distanceToLineStart - h*h) < 5) {
        next_nodes.push(ResultObj(lineStartNode, distanceToLineStart));
        previous_nodes.push(ResultObj(lineEndNode, distanceToLineEnd));
    }
    else {
        for (let i = 0, n = lineEndNode.next_nodes.length, node_obj = lineEndNode.next_nodes[0]; i < n; node_obj = lineEndNode.next_nodes[++i]) {
            if (node_obj.node == lineStartNode) {
                next_nodes.push(ResultObj(lineStartNode, distanceToLineStart));
                previous_nodes.push(ResultObj(lineEndNode, distanceToLineEnd));
                break;
            }
        }
    }
    let newNode = {lat, lng, next_nodes, previous_nodes};

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //lineStartNode.next_nodes.push(ResultObj(newNode, Math.sqrt(distanceToLineStart*distanceToLineStart - h*h)));
    //lineEndNode.next_nodes.push(ResultObj(newNode, Math.sqrt(distanceToLineEnd*distanceToLineEnd - h*h)));

    //console.log("next_nodes", next_nodes);

    return ResultObj(newNode, h);
}

var GraphTypes = {
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
    }
    static fromOsmGraph(osm_graph_elements, type){
        let result = initializeFromOsmGraph(osm_graph_elements, type);
        return new RoadGraph(result.ways, result.nodes, type);
    }


    findShortestWayByCoords(fromCoords, toCoords) {
        /*let startNode, finalNode;
        if (this.graphType === GraphTypes.pedestrian) {
            startNode = createNodeWithRelationsToNearestNodes(fromCoords)//...
        }*/
        let nearestNode = this.getNearestPlace(fromCoords); //this.getNearestNode(fromCoords);
        let nearestNodeTo = this.getNearestPlace(toCoords);////////////////////////////////////////////////////////////////////////////////////////
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
    findShortestWay(startNode, finalNode){
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
        let result = [];
        for (let i = 0, num_of_nodes = this.nodes.length, node = this.nodes[0]; i < num_of_nodes; node = this.nodes[++i]) {
            if (distance(coords, node /*{lat: node.lat, lng: node.lon}*/) < radius) {
                result.push(node);
            }
        }
        return result;
    }
    getNearestNode(coords) {
        let result = null;
        let minDistance = 1000000000;
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
        let minDistance = 1000000000;
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