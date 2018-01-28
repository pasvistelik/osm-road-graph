
import Point from './point';
import distance from 'geo-coords-distance';

class Points {
    constructor(fromNode, toNode) {
        this.collection = [];

        this.finalPointCoords = {
            lat: toNode.lat,
            lng: toNode.lng
        };

        this.startPoint = new Point(fromNode, 0, distance(fromNode, this.finalPointCoords));
        this.finalPoint = new Point(toNode, 2160000000, 0);
        
        this.currentSelectedPoint = null;

        this.collection.push(this.startPoint);
        this.collection.push(this.finalPoint);
    }
    findElement(node) {
        if (node.point != null) return node.point;
        var newCreatedPoint = new Point(node, 2160000000, distance(node, this.finalPointCoords));
        this.collection.push(newCreatedPoint);
        return newCreatedPoint;
    }
    getNextUnvisitedPoint() {
        if (this.currentSelectedPoint != null) this.currentSelectedPoint.setVisited();
        this.currentSelectedPoint = this.selectPointWithMinimalMark();
        return this.currentSelectedPoint;
    }
    selectPointWithMinimalMark() {
        for (var i = 0, n = this.collection.length, t = this.collection[0], p = null, currentMarkValue; i < n; t = this.collection[++i]) {
            if (!(t.isVisited)) {
                p = t;
                currentMarkValue = p.totalDistance + p.heuristicDistanceToFinalPoint;
                for (t = this.collection[++i]; i < n; t = this.collection[++i]) {
                    if (!(t.isVisited) && t.totalDistance + t.heuristicDistanceToFinalPoint < currentMarkValue) {
                        p = t;
                        currentMarkValue = p.totalDistance + p.heuristicDistanceToFinalPoint;
                    }
                }
                return p;
            }
        }
        return null;
    }
    countShortestWay() {
        let counter = 1;
        for (let selectedPoint = this.getNextUnvisitedPoint(), selectedPointNode, selectedPointTotalDistance, nodesOfNode; selectedPoint != null; selectedPoint = this.getNextUnvisitedPoint()) {
            counter++;
            selectedPointTotalDistance = selectedPoint.totalDistance;
            selectedPointNode = selectedPoint.node;
            nodesOfNode = selectedPointNode.next_nodes;

            //console.log(selectedPointNode.id);//

            // Завершаем поиск, если значение метки превышает минимальное найденное расстояние до пункта назначения:
            if (selectedPointTotalDistance + selectedPoint.heuristicDistanceToFinalPoint > this.finalPoint.totalDistance) {
                console.log("Breaked.");
                break;
            }

            // Просматриваем все возможные дальнейшие шаги из текушей вершины:
            for (let i = 0, n = nodesOfNode.length, nextNodeObj = nodesOfNode[0]; i < n; nextNodeObj = nodesOfNode[++i]) {
                
                //console.log("[" + selectedPointNode.id + " to " + nextNodeObj.node.id + "]: " + nextNodeObj.distance);

                let nextPoint = this.findElement(nextNodeObj.node);
                //let oldDistance = nextPoint.totalDistance;
                if (nextPoint.tryUpdate(selectedPointTotalDistance + nextNodeObj.distance, selectedPoint)) {
                    /*if(nextPoint == this.finalPoint) {
                        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

                        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

                        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                    }
                    console.log(oldDistance + " changed to (" + selectedPointTotalDistance + " + " + nextNodeObj.distance + ") = " + nextPoint.totalDistance);*/
                }
            }
            

        }

        Point.clearNodes(); // delete ".point" from all used nodes
        console.log("All: "+counter);
    }

}

export default Points;