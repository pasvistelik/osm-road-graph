import initializeFromOsmGraph from '../lib/initialize';
import distance from 'geo-coords-distance';
import Points from './dijkstra/points';
import points from './dijkstra/points';

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
        return this.findShortestWay(this.getNearestNode(fromCoords), this.getNearestNode(toCoords));
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
        console.log(JSON.stringify(coordsList));

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
}

export default RoadGraph;