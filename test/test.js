
import {elements as roads_graph} from '../test/roads_grodno.json';
//import {elements as roads_graph} from '../test/2KNodes.json';
//import {elements as roads_graph} from '../test/100KNodes.json';
//import {elements as roads_graph} from '../test/200KNodes.json';

import RoadGraph from '../lib/roadGraph';

let roadGraph = RoadGraph.fromOsmGraph(roads_graph);


let startSortingMoment = Date.now();
console.log(roadGraph.getNodesAround({lat: 53.6843, lng: 23.83872}, 50).length);
console.log("TEST 0. Time = " + (Date.now() - startSortingMoment) + " ms.");


//let node1 = roadGraph.nodes[5];
let node1 = roadGraph.getNodesAround({lat: 53.6843, lng: 23.83872}, 50)[0]
let node2 = roadGraph.getNodesAround(node1, 10000)[400];
//let node2 = roadGraph.nodes[100];

console.log("["+node1.lat+";"+node1.lng+"]");
console.log("["+node2.lat+";"+node2.lng+"]");
roadGraph.findShortestWay(node1, node2);