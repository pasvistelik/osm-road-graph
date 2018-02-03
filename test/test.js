
//import {elements as roads_graph} from '../test/roads_grodno.json';
//import {elements as roads_graph} from '../test/2KNodes.json';
//import {elements as roads_graph} from '../test/100KNodes.json';
//import {elements as roads_graph} from '../test/200KNodes.json';
//import {elements as roads_graph} from '../test/without_service.json';
import {elements as roads_graph} from '../test/with_footways.json';

import RoadGraph from '../lib/roadGraph';

let roadGraph = RoadGraph.fromOsmGraph(roads_graph, RoadGraph.GraphTypes.pedestrian);

let counter = 0;
for (let i = 0, n = roadGraph.nodes.length, node = roadGraph.nodes[0]; i < n; node = roadGraph.nodes[++i]) {
    if (node.next_nodes.length == 2) counter++;
}
console.log("TEST 2. "+counter+" from "+roadGraph.nodes.length+" nodes ("+(~~(100*counter/roadGraph.nodes.length))+"%).");



let startSortingMoment = Date.now();
console.log(roadGraph.getNodesAround({lat: 53.6843, lng: 23.83872}, 50).length);
console.log("TEST 0. Time = " + (Date.now() - startSortingMoment) + " ms.");


//let node1 = roadGraph.nodes[5];
let node1 = roadGraph.getNodesAround({lat: 53.6843, lng: 23.83872}, 50)[0]
let node2 = roadGraph.getNodesAround(node1, 10000)[400];
//let node2 = roadGraph.nodes[100];

//roadGraph.findShortestWay(node1, node2);
let result = roadGraph.findShortestWayByCoords({lat: node1.lat+0.01, lng: node1.lng+0.01}, node2);
console.log(result);