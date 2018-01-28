
class Point {
    constructor(node, totalDistance, heuristicDistanceToFinalPoint) {
        this.node = node;
        node.point = this;
        this.totalDistance = totalDistance;
        this.heuristicDistanceToFinalPoint = heuristicDistanceToFinalPoint;
        this.isVisited = false;

        Point.usedNodes.push(node);
    }
    tryUpdate(newTotalDistance, previousPoint) {
        if (newTotalDistance < this.totalDistance) {
            this.previousPoint = previousPoint;
            this.totalDistance = newTotalDistance;
            return true;
        }
        return false;
    }
    setVisited() {
        this.isVisited = true;
    }

    static usedNodes = [];
    static clearNodes() {
        for (let i = 0, n = Point.usedNodes.length, node = Point.usedNodes[0]; i < n; node = Point.usedNodes[++i]) {
            delete node.point;
        }
        Point.usedNodes = [];
    }
}

export default Point;