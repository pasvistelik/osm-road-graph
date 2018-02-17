
## Usage examples:
Initialize:
```js
import RoadGraph from 'osm-road-graph/lib/roadGraph';
import {elements as roads_graph} from 'osm-road-graph/test/with_footways.json';

const roadGraph = RoadGraph.fromOsmGraph(roads_graph, RoadGraph.GraphTypes.pedestrian);
```

Find way by coords:
```js
const coords1 = {lat: 53.68350, lng: 23.83437};
const coords2 = {lat: 53.67722, lng: 23.82298};

const result = roadGraph.findShortestWayByCoords(coords1, coords2);
```

Find way between road graph nodes (works faster than counting by coords): 
```js
const node1 = roadGraph.nodes[5];
const node2 = roadGraph.nodes[100];

const result = roadGraph.findShortestWay(node1, node2);
```

## TODO:
* Add function for generating distance matrix
