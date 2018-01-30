import Heap from 'heap';
import Point from './point';
import distance from 'geo-coords-distance';

function comparePointsFunction(a,b) {
    return (a.totalDistance + a.heuristicDistanceToFinalPoint) - (b.totalDistance + b.heuristicDistanceToFinalPoint);
}

class Points {
    constructor(fromNode, toNode) {
        this.collection = new Heap(comparePointsFunction);

        this.finalPointCoords = {
            lat: toNode.lat,
            lng: toNode.lng
        };

        this.startPoint = new Point(fromNode, 0, distance(fromNode, this.finalPointCoords));
        this.finalPoint = new Point(toNode, 2160000000, 0);
        
        this.currentSelectedPoint = null;

        this.collection.push(this.startPoint);
        //this.collection.push(this.finalPoint);
    }
    findElement(node) {
        if (node.point) return node.point;
        var newCreatedPoint = new Point(node, 2160000000, distance(node, this.finalPointCoords));
        this.collection.push(newCreatedPoint);
        return newCreatedPoint;
    }
    getNextUnvisitedPoint() {
        if (this.currentSelectedPoint != null) this.currentSelectedPoint.setVisited();
        if (this.currentSelectedPoint == this.finalPoint) return null; // stop if final point was visited

        this.currentSelectedPoint = this.collection.pop();
        return this.currentSelectedPoint;
    }
    countShortestWay() {
        let counter = 1;
        for (let selectedPoint = this.startPoint, selectedPointNode, selectedPointTotalDistance, nodesOfNode; selectedPoint != null; selectedPoint = this.getNextUnvisitedPoint()) {

            //console.log(counter, selectedPoint);
            counter++;
            selectedPointTotalDistance = selectedPoint.totalDistance;
            selectedPointNode = selectedPoint.node;
            nodesOfNode = selectedPointNode.next_nodes;

            // Завершаем поиск, если значение метки превышает минимальное найденное расстояние до пункта назначения:
            if (selectedPointTotalDistance + selectedPoint.heuristicDistanceToFinalPoint > this.finalPoint.totalDistance) {
                console.log("Breaked.");
                break;
            }

            // Просматриваем все возможные дальнейшие шаги из текушей вершины:
            nodesOfNode.forEach(function (nextNodeObj) {
                let nextPoint = this.findElement(nextNodeObj.node);
                if(nextPoint.tryUpdate(selectedPointTotalDistance + nextNodeObj.distance, selectedPoint)) {
                    this.collection.updateItem(nextPoint);
                }
            }, this);
            
        }

        Point.clearNodes(); // delete ".point" from all used nodes
        console.log("All: "+counter);
    }

}

export default Points;