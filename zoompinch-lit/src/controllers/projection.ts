import { rotatePoint } from '../util/helpers';

export function clientCoordsToWrapperCoords(clientX: number, clientY: number, wrapperInnerX: number, wrapperInnerY: number) {
  return [clientX - wrapperInnerX, clientY - wrapperInnerY] as [number, number];
}
export function relativeWrapperCoordinatesFromClientCoords(clientX: number, clientY: number, wrapperInnerX: number, wrapperInnerY: number, wrapperInnerWidth: number, wrapperInnerHeight: number) {
  const [x, y] = clientCoordsToWrapperCoords(clientX, clientY, wrapperInnerX, wrapperInnerY);
  return [x / wrapperInnerWidth, y / wrapperInnerHeight] as [number, number];
}
export function getCanvasCoords(x: number, y: number, canvasWidth: number, canvasHeight: number, translateX: number, translateY: number, rotate: number, scale: number) {
  // Anchor is relative wrapper inner 0,0
  const anchor = [0, 0] as [number, number];
  // Untranslate the point
  const untranslatedPoint = [x - translateX, y - translateY] as [number, number];
  // Unrotate the point
  const unrotatedPoint = rotatePoint(untranslatedPoint, anchor, -rotate);
  // Unscale the point
  const unscaledPoint = [unrotatedPoint[0] / scale, unrotatedPoint[1] / scale];
  // Return the point relative to the canvas natural size
  const pointRel = [unscaledPoint[0] / canvasWidth, unscaledPoint[1] / canvasHeight] as [number, number];
  return pointRel;
}
export function normalizeMatrixCoordinates(clientX: number, clientY: number, wrapperInnerX: number, wrapperInnerY: number, canvasWidth: number, canvasHeight: number, translateX: number, translateY: number, rotate: number, scale: number) {
  const innerWrapperCoords = clientCoordsToWrapperCoords(clientX, clientY, wrapperInnerX, wrapperInnerY);
  return getCanvasCoords(innerWrapperCoords[0], innerWrapperCoords[1], canvasWidth, canvasHeight, translateX, translateY, rotate, scale);
}
export function composePoint(
  x: number,
  y: number,
  currScale: number,
  currTranslate: [number, number],
  currRotate: number,
  canvasWidth: number,
  canvasHeight: number,
  offset: { left: number; top: number; right: number; bottom: number },
  naturalScale: number
) {
  // Anchor is 0, 0
  const anchor = [offset.left, offset.left] as [number, number];
  // Scale the point
  const scaledPoint = [offset.left + canvasWidth * (currScale * naturalScale) * x, offset.top + canvasHeight * (currScale * naturalScale) * y] as [number, number];
  // Rotate around the anchor
  const rotatedPoint = rotatePoint(scaledPoint, anchor, currRotate);
  // Translate straightforward
  const translatedPoint = [rotatedPoint[0] + currTranslate[0], rotatedPoint[1] + currTranslate[1]] as [number, number];

  return translatedPoint;
}
export function calcProjectionTranslate(
  newScale: number,
  wrapperPosition: [number, number],
  canvasPosition: [number, number],
  canvasWidth: number,
  canvasHeight: number,
  wrapperInnerWidth: number,
  wrapperInnerHeight: number,
  naturalScale: number,
  rotate: number
) {
  // Calculate the intrinsic dimensions of the canvas
  const canvasIntrinsicWidth = canvasWidth * naturalScale;
  const canvasIntrinsicHeight = canvasHeight * naturalScale;
  // Calculate the real dimensions of the canvas
  const canvasRealX = canvasPosition[0] * canvasIntrinsicWidth * newScale;
  const canvasRealY = canvasPosition[1] * canvasIntrinsicHeight * newScale;
  const canvsRealRotated = rotatePoint([canvasRealX, canvasRealY], [0, 0], rotate);
  // Calculate the real dimensions of the wrapper
  const wrapperRealX = wrapperPosition[0] * wrapperInnerWidth;
  const wrapperRealY = wrapperPosition[1] * wrapperInnerHeight;
  // Calculate the delta between the canvas and the wrapper
  const deltaX = wrapperRealX - canvsRealRotated[0];
  const deltaY = wrapperRealY - canvsRealRotated[1];

  return [deltaX, deltaY] as [number, number];
}
