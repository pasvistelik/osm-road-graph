import initializeFromOsmGraph from '../lib/initialize';
import distance from 'geo-coords-distance';

class RoadGraph {
    constructor(ways, nodes) {
        this.ways = ways;
        this.nodes = nodes;
    }
    static fromOsmGraph(osm_graph_elements){
        let result = initializeFromOsmGraph(osm_graph_elements);
        return new RoadGraph(result.ways, result.nodes);
    }

    findShortestWay(startNode, FinalNode){
        let unvisited_nodes = [];
        let visited_nodes = [];


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
}

export default RoadGraph;