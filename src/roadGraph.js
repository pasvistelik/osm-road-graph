import initializeFromOsmGraph from '../lib/initialize';
import distance from 'geo-coords-distance';
import Points from './dijkstra/points';

function bindToLineSegment(fromCoords, lineStartNode, lineEndNode) {
    let distanceToLineStart = distance(fromCoords, lineStartNode);
    let distanceToLineEnd = distance(fromCoords, lineEndNode);
    let lineLength = distance(lineStartNode, lineEndNode);

    let ResultObj = (node, distance) => { return {node, distance} };

    if (lineLength*lineLength < Math.abs(distanceToLineStart*distanceToLineStart - distanceToLineEnd*distanceToLineEnd)) {
        if (distanceToLineStart < distanceToLineEnd) return ResultObj(lineStartNode, distanceToLineStart);
        return ResultObj(lineEndNode, distanceToLineEnd);
    }
    
    let p = (distanceToLineStart + distanceToLineEnd + lineLength) / 2;
    let h = 2 * Math.sqrt(p * (p - distanceToLineStart) * (p - distanceToLineEnd) * (p - lineLength)) / lineLength;
    
    let tmp = Math.sqrt(distanceToLineStart*distanceToLineStart - h*h);
    //console.log(tmp + " / " + lineLength);
    let lat = lineEndNode.lat + (lineLength - tmp) * (lineStartNode.lat - lineEndNode.lat) / lineLength;
    //console.log(lat + " from " + lineStartNode.lat + "and" + lineEndNode.lat);
    let lng = lineEndNode.lng + (lineLength - tmp) * (lineStartNode.lng - lineEndNode.lng) / lineLength;
    
    let next_nodes = [];
    //if (lineStartNode.next_nodes && lineStartNode.next_nodes.includes(lineEndNode)) 
    next_nodes.push(ResultObj(lineEndNode, distanceToLineEnd));
    next_nodes.push(ResultObj(lineStartNode, distanceToLineStart));
    //if (lineEndNode.next_nodes && lineEndNode.next_nodes.includes(lineStartNode)) next_nodes.push(lineStartNode);
    let newNode = {lat, lng, next_nodes};

    //console.log("next_nodes", next_nodes);

    return ResultObj(newNode, h);
}

class RoadGraph {
    constructor(ways, nodes) {
        this.ways = ways;
        this.nodes = nodes;
    }
    static fromOsmGraph(osm_graph_elements){
        let result = initializeFromOsmGraph(osm_graph_elements);
        return new RoadGraph(result.ways, result.nodes);
    }


    findShortestWayByCoords(fromCoords, toCoords) {
        let nearestNode = this.getNearestPlace(fromCoords); //this.getNearestNode(fromCoords);
        let result = this.findShortestWay(nearestNode, this.getNearestNode(toCoords));

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

        let startSortingMoment = Date.now();

        let points = new Points(startNode, finalNode);
        points.countShortestWay();

        console.log("TEST 1. Time = " + (Date.now() - startSortingMoment) + " ms.");


        let tmp_str = "";
        let counter = 0;
        let coordsList = [];
        for (let currentPoint = points.finalPoint; currentPoint != null; ) {
            tmp_str += currentPoint.node.id + "("+currentPoint.totalDistance+")" + " < < < ";
            coordsList.push({
                lat: currentPoint.node.lat,
                lng: currentPoint.node.lng
            });

            currentPoint = currentPoint.previousPoint;
            counter++;
        }
        //console.log(tmp_str);
        console.log("NODES: "+counter);
        //console.log(JSON.stringify(coordsList));

        return coordsList.reverse();
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
        return result;
    }
}

export default RoadGraph;