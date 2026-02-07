const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

/** Spherical linear interpolation between two lat/lng points. Returns array of [lat, lng] pairs. */
export function greatCirclePath(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  numPoints = 100,
): [number, number][] {
  const φ1 = lat1 * DEG;
  const λ1 = lng1 * DEG;
  const φ2 = lat2 * DEG;
  const λ2 = lng2 * DEG;

  const d = 2 * Math.asin(
    Math.sqrt(
      Math.sin((φ2 - φ1) / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2,
    ),
  );

  if (d < 1e-10) {
    return [[lat1, lng1]];
  }

  const points: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * RAD;
    const lng = Math.atan2(y, x) * RAD;
    points.push([lat, lng]);
  }
  return points;
}

/** Find the index in a path array closest to a given lat/lng. */
export function closestPointIndex(
  path: [number, number][],
  lat: number,
  lng: number,
): number {
  let minDist = Infinity;
  let minIdx = 0;
  for (let i = 0; i < path.length; i++) {
    const dlat = path[i][0] - lat;
    const dlng = path[i][1] - lng;
    const dist = dlat * dlat + dlng * dlng;
    if (dist < minDist) {
      minDist = dist;
      minIdx = i;
    }
  }
  return minIdx;
}
