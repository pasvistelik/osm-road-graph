
//import {elements as roads_graph} from '../test/roads_grodno.json';
//import {elements as roads_graph} from '../test/2KNodes.json';
//import {elements as roads_graph} from '../test/100KNodes.json';
import {elements as roads_graph} from '../test/200KNodes.json';

import RoadGraph from '../lib/roadGraph';

let roadGraph = RoadGraph.fromOsmGraph(roads_graph);


let startSortingMoment = Date.now();
console.log(roadGraph.getNodesAround({lat: 53.6843, lng: 23.83872}, 50).length);
console.log("TEST 0. Time = " + (Date.now() - startSortingMoment) + " ms.");