import distance from 'geo-coords-distance';

function binaryFind(array, predicateForArrayItem)
{
    let i = 0, j = array.length, k, predicateResult, currentItem; 
                                 
    while (i < j){
        k = ~~((i+j)/2);
        currentItem = array[k];
        predicateResult = predicateForArrayItem(currentItem, k, array);

        if (predicateResult === 0) return currentItem;
        else if (predicateResult === 1) j = k;
        else i = k+1;
    }
    return null;
}
function getFindingNodeFunc(node_id) {
    return function(element, index, array){
        let current_id = element.id
        if (current_id > node_id) return 1;
        else if (current_id < node_id) return -1;
        return 0;
    }
}
function compare_ids(a, b){
    if (a.id > b.id) return 1;
    if (a.id < b.id) return -1;
    return 0;
}
function initialize(osm_graph_elements) {


    let startMoment = Date.now();

    let ways = [];
    let nodes = [];
    let ways_index = 0;
    let nodes_index = 0;
    for (let i = 0, n = osm_graph_elements.length, item = osm_graph_elements[0]; i < n; item = osm_graph_elements[++i]) {
        //console.log(item,);
        switch(item.type){
            case "way": {
                item.local_id = ways_index++;
                ways.push(item);
                break;
            }
            case "node": {
                nodes.push(item);
                break;
            }
            default: break;
        }
    }

    let startSortingMoment = Date.now();
    nodes.sort(compare_ids); // ToDo: use TimSort or others if it spend a long time... (nodes in OSM partially sorted)
    //console.log("Sorted. Time = " + (Date.now() - startSortingMoment) + " ms.");

    for (let i = 0, n = nodes.length, node = nodes[0]; i < n; node = nodes[++i]) {
        node.local_id = nodes_index++;
        node.next_nodes = [];
        node.lng = node.lon;
        //delete node.lon;
        //node.previous_nodes = [];
    }
    //console.log("Nodes are modified. Time = " + (Date.now() - startSortingMoment) + " ms.");

    for (let j = 0, m = ways.length, way = ways[0]; j < m; way = ways[++j]) {
        let is_oneway = (way.tags.oneway == "yes" || way.tags.junction == "roundabout");
        for (let previous_dist, dist, i = 1, n = way.nodes.length + 1, previous_node = null, current_node = binaryFind(nodes, getFindingNodeFunc(way.nodes[0])), next_node = ((way.nodes[1]) ? binaryFind(nodes, getFindingNodeFunc(way.nodes[1])): null); i < n; previous_node = current_node, current_node = next_node, next_node = ((way.nodes[++i]) ? binaryFind(nodes, getFindingNodeFunc(way.nodes[i])): null)) {

            if (next_node) {
                
                dist = ~~distance(current_node, next_node);
                //let dist = ~~distance({lat: current_node.lat, lng: current_node.lon}, {lat: next_node.lat, lng: next_node.lon})
                current_node.next_nodes.push({
                    node: next_node,
                    distance: dist
                });
                /*next_node.previous_nodes.push({
                    node: current_node,
                    distance: dist
                });*/
            
            }
            // if road is not one-way only:
            if (!is_oneway && previous_node) {
                //let dist = ~~distance(current_node, previous_node);
                //let dist = ~~distance({lat: current_node.lat, lng: current_node.lon}, {lat: previous_node.lat, lng: previous_node.lon})
                current_node.next_nodes.push({
                    node: previous_node,
                    distance: previous_dist//dist
                });
                /*previous_node.previous_nodes.push({
                    node: current_node,
                    distance: dist
                });*/
            }
            previous_dist = dist;
        }
    }

    console.log("Initialized (" + nodes.length + " nodes). Time = " + (Date.now() - startMoment) + " ms.");

    return { ways, nodes };
}

export default initialize;