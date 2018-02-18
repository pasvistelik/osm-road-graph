import distance from 'geo-coords-distance';
import {GraphTypes} from './roadGraph';

function makeDistanceMatrix(points, gettingCoordsFunc = null, distanceLimit = Infinity, gettingPointIdentificatorFunc = null, updatingPointFunc = null) {
    let distanceMatrix = [];
    if (!gettingCoordsFunc) gettingCoordsFunc = (p => {return {lat: p.lat, lng: p.lng}});
    if (!gettingPointIdentificatorFunc) gettingPointIdentificatorFunc = (p => p);
    if (!updatingPointFunc) updatingPointFunc = ((currentPoint, otherPoint, distance) => {});
    const isDistancesBijective = this.graphType !== GraphTypes.car;
    const f = isDistancesBijective ? (i => i+1) : (i => 0);
    for (let i = 0, n = points.length, startPoint = points[0], startPointCoords, heuristicDistance; i < n; startPoint = points[++i]) {
        startPointCoords = gettingCoordsFunc(startPoint);
        const startPointKey = gettingPointIdentificatorFunc(startPoint);
        if(!distanceMatrix[startPointKey]) distanceMatrix[startPointKey] = [];
        for (let j = f(i), finalPoint = points[j], finalPointCoords; j < n; finalPoint = points[++j]) {
            if (i === j) continue;
            finalPointCoords = gettingCoordsFunc(finalPoint);
            const finalPointKey = gettingPointIdentificatorFunc(finalPoint);
            
            heuristicDistance = distance(startPointCoords, finalPointCoords);
            if (heuristicDistance >= distanceLimit) continue;

            let realDistance = this.findShortestWayByCoords(startPointCoords, finalPointCoords).distance;
            if (realDistance >= distanceLimit) continue;

            distanceMatrix[startPointKey].push({key: finalPointKey, distance: realDistance});
            updatingPointFunc(startPoint, finalPoint, realDistance);

            if (isDistancesBijective) {
                if(!distanceMatrix[finalPointKey]) distanceMatrix[finalPointKey] = [];
                distanceMatrix[finalPointKey].push({key: startPointKey, distance: realDistance});
                updatingPointFunc(finalPoint, startPoint, realDistance);
            }
        }
    }
    return distanceMatrix;
}

export default makeDistanceMatrix;