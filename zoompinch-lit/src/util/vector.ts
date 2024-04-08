type Point = [number, number];

export function getAngleBetweenTwoPoints(p1: [number, number], p2: [number, number]) {
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
}
function radianToDegree(radian: number) {
  return (radian * 180) / Math.PI;
}

// Funktion, die aus einem Winkel einen Vektor erstellt
export function angleToVector(angle: number): Point {
  return [Math.cos(angle), Math.sin(angle)];
}
export function getVectorBetweenTwoPoints(p1: [number, number], p2: [number, number]): [number, number] {
  return [p2[0] - p1[0], p2[1] - p1[1]];
}
export function rotateVector(vector: [number, number], angle: number): [number, number] {
  const [x, y] = vector;
  return [x * Math.cos(angle) - y * Math.sin(angle), x * Math.sin(angle) + y * Math.cos(angle)];
}

// Funktion, die von einem Startpunkt aus einen Vektor und eine Länge nimmt
// und sich nach der Länge auf dem Vektor bewegt und dann den Punkt ausgibt
export function moveAlongVector(startPoint: Point, vector: Point, length: number): Point {
  const deltaX = vector[0] * length;
  const deltaY = vector[1] * length;
  return [startPoint[0] + deltaX, startPoint[1] + deltaY];
}

export function rotatePoint(point: [number, number], center: [number, number], angleInRadians: number): [number, number] {
  const [x, y] = point;
  const [cx, cy] = center;

  const rotatedX = Math.cos(angleInRadians) * (x - cx) - Math.sin(angleInRadians) * (y - cy) + cx;
  const rotatedY = Math.sin(angleInRadians) * (x - cx) + Math.cos(angleInRadians) * (y - cy) + cy;

  return [rotatedX, rotatedY];
}
