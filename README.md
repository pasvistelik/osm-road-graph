
## Usage examples:
### Initialize:
```js
import RoadGraph from 'osm-road-graph/lib/roadGraph';
import {elements as roads_graph} from 'osm-road-graph/test/with_footways.json';

const roadGraph = RoadGraph.fromOsmGraph(roads_graph, RoadGraph.GraphTypes.pedestrian);
```
### Ways finding:
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

Result:
```js
{ 
  distance: 7355,
  polyline: [ 
    {lat: 53.68350, lng: 23.83437},
      ...
    {lat: 53.67722, lng: 23.82298}
  ]
}
```

### Distance matrix calculation:
#### Basic:
```js
let points = [ {lat: 53.67719, lng: 23.823}, {lat: 53.68384, lng: 23.83443}, {lat: 53.68817, lng: 23.84796} ];
const distanceMatrix = roadGraph.makeDistanceMatrix(points);
```
Results - Distance matrix:
```js 
[ 
  [point_object_1]: [ 
    { key: [point_object_2], distance: 1234 },
    ...
   ],
   ...
]
```

#### Extended:
_makeDistanceMatrix_ params:
```js
points, // Any collection of objects which have coords

gettingCoordsFunc = null, // A function which must returns {lat, lng} from object

distanceLimit = Infinity, // Maximal distance which can be added into distance matrix

gettingPointIdentificatorFunc = null, // A function which returns key from object (by default is same object)

updatingPointFunc = null // A function for collection object modifying
```
Example:
```js
let points = [
    {
        name: "Castle",
        coords: {lat: 53.67719, lng: 23.823}
    }, {
        name: "City Square",
        coords: {lat: 53.68384, lng: 23.83443}
    }, {
        name: "Zoo",
        coords: {lat: 53.68817, lng: 23.84796}
    }
];
const gettingCoordsFunc = (p => p.coords);
const gettingPointIdentificatorFunc = (p => p.name);
const updatingPointFunc = (function(currentPoint, otherPoint, distance){
    if (!currentPoint.distances) currentPoint.distances = [];
    currentPoint.distances.push({point: otherPoint.name, distance});
});
const distanceMatrix = roadGraph.makeDistanceMatrix(points, gettingCoordsFunc, 1500, gettingPointIdentificatorFunc, updatingPointFunc);
```
Results - Distance matrix:
```js 
[ 
  'Castle': [ 
    { key: 'City Square', distance: 1202 } 
   ],
  'City Square': [ 
    { key: 'Castle', distance: 1202 },
    { key: 'Zoo', distance: 1242 } 
  ],
  'Zoo': [ 
    { key: 'City Square', distance: 1242 } 
  ]
]
```
Results - Modified points object:
```js
[ 
  { 
    name: 'Castle',
    coords: { lat: 53.67719, lng: 23.823 },
    distances: [ {point: "City Square", distance: 1202}, ... ] 
  },
  ...
]
```


## Todo:
- [x] Add function for generating distance matrix.
- [ ] Jump through single-way-out nodes.
