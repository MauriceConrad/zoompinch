export function radiansToDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}
export function degreeToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getAngleBetweenTwoPoints(p1: [number, number], p2: [number, number]) {
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
}

export function rotatePoint(point: [number, number], center: [number, number], angleInRadians: number): [number, number] {
  const [x, y] = point;
  const [cx, cy] = center;

  const rotatedX = Math.cos(angleInRadians) * (x - cx) - Math.sin(angleInRadians) * (y - cy) + cx;
  const rotatedY = Math.sin(angleInRadians) * (x - cx) + Math.cos(angleInRadians) * (y - cy) + cy;

  return [rotatedX, rotatedY];
}

export function angleToVector(angle: number): [number, number] {
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
export function moveAlongVector(startPoint: [number, number], vector: [number, number], length: number): [number, number] {
  const deltaX = vector[0] * length;
  const deltaY = vector[1] * length;
  return [startPoint[0] + deltaX, startPoint[1] + deltaY];
}

export function round(value: number, decimals: number) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
