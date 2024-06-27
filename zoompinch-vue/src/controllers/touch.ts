import { Ref } from 'vue';
import { clamp, getAngleBetweenTwoPoints, rotatePoint } from './helpers';

export function useTouch({
  wrapperInnerWidth,
  wrapperInnerHeight,
  canvasNaturalWidth,
  canvasNaturalHeight,
  translate,
  rotate,
  scale,
  offset,
  rotationEnabled,
  minScale,
  maxScale,
  naturalScale,
  clientCoordsToWrapperCoords,
  getCanvasCoords,
  calcProjectionTranslate,
}: {
  wrapperInnerWidth: Ref<number>;

  wrapperInnerHeight: Ref<number>;
  canvasNaturalWidth: Ref<number>;
  canvasNaturalHeight: Ref<number>;
  scale: Ref<number>;
  rotate: Ref<number>;
  translate: Ref<[number, number]>;
  offset: Ref<{ top: number; left: number }>;
  rotationEnabled: Ref<boolean>;
  minScale: Ref<number>;
  maxScale: Ref<number>;
  naturalScale: Ref<number>;
  clientCoordsToWrapperCoords: (clientX: number, clientY: number) => [number, number];
  getCanvasCoords: (x: number, y: number) => [number, number];
  calcProjectionTranslate: (
    scale: number,
    wrapperInnerCoords: [number, number],
    canvasAnchorCoords: [number, number],
    virtualRotate?: number
  ) => [number, number];
}) {
  let touchStarts:
    | {
        client: [number, number];
        canvasRel: [number, number];
      }[]
    | null = null;
  let touchStartScale = 1;
  let touchStartTranslate = [0, 0] as [number, number];
  let touchStartRotate = 0;

  const freezeTouches = (touches: TouchList) => {
    return Array.from(touches).map((touch) => {
      const wrapperCoords = clientCoordsToWrapperCoords(touch.clientX, touch.clientY);
      return {
        client: [touch.clientX, touch.clientY] as [number, number],
        canvasRel: getCanvasCoords(wrapperCoords[0], wrapperCoords[1]),
      };
    });
  };

  const handleTouchstart = (event: TouchEvent) => {
    const isWithinMatrix = (event.target as HTMLElement).closest('.matrix') !== null;
    if (isWithinMatrix) {
      return;
    }

    event.preventDefault();
    touchStarts = freezeTouches(event.touches);
    touchStartScale = scale.value;
    touchStartTranslate = [translate.value[0], translate.value[1]];
    touchStartRotate = rotate.value;

    //console.log('touchStarts', touchStarts);
  };

  const handleTouchmove = (event: TouchEvent) => {
    const isWithinMatrix = (event.target as HTMLElement).closest('.matrix') !== null;
    if (isWithinMatrix) {
      return;
    }
    event.preventDefault(); // Prevent default touch behavior

    // Make the touch positions become relative to the inner wrapper
    const touchPositions = Array.from(event.touches).map((touch) => clientCoordsToWrapperCoords(touch.clientX, touch.clientY));

    if (touchStarts) {
      if (touchPositions.length >= 2 && touchStarts.length >= 2) {
        // Multi finger touch implementation
        // We're calculating:
        // 1. The scale projection and scale relied delta
        // 2. The rotation projection and rotation delta

        // SCALE

        // Calculate the distance between the two fingers at the start
        const fingerOneStartCanvasCoords = [
          touchStarts[0].canvasRel[0] * canvasNaturalWidth.value,
          touchStarts[0].canvasRel[1] * canvasNaturalHeight.value,
        ] as [number, number];
        const fingerTwoStartCanvasCoords = [
          touchStarts[1].canvasRel[0] * canvasNaturalWidth.value,
          touchStarts[1].canvasRel[1] * canvasNaturalHeight.value,
        ] as [number, number];

        // This is the absolute distance between the two fingers at the start
        const fingerStartCanvasCoordsDelta = Math.sqrt(
          Math.pow(fingerOneStartCanvasCoords[0] - fingerTwoStartCanvasCoords[0], 2) +
            Math.pow(fingerOneStartCanvasCoords[1] - fingerTwoStartCanvasCoords[1], 2)
        );

        // This is the absolute distance between the two fingers now
        const fingersNowDelta =
          Math.sqrt(
            Math.pow(touchPositions[0][0] - touchPositions[1][0], 2) + Math.pow(touchPositions[0][1] - touchPositions[1][1], 2)
          ) / naturalScale.value;

        // This is the future scale
        const futureScale = clamp(fingersNowDelta / fingerStartCanvasCoordsDelta, minScale.value, maxScale.value);
        // Justcalculate the relative coordinates of the inner wrapper and the canvas
        const innerWrapperRelPos = [
          touchPositions[0][0] / wrapperInnerWidth.value,
          touchPositions[0][1] / wrapperInnerHeight.value,
        ] as [number, number];
        const innerCanvasRel = touchStarts[0].canvasRel;

        // Project the scale
        const [scaleDeltaX, scaleDeltaY] = calcProjectionTranslate(futureScale, innerWrapperRelPos, innerCanvasRel, 0);

        let rotationDeltaX = 0;
        let rotationDeltaY = 0;
        let deltaAngle = 0;

        // ROTATION

        if (rotationEnabled.value) {
          // Angle between the two fingers at the start
          const startAngle = getAngleBetweenTwoPoints(fingerOneStartCanvasCoords, fingerTwoStartCanvasCoords);
          // Angle between the first finger at the start and the second finger at the current position
          // we're doing this because we're projecting always from the first finger, so it's the anchor point
          const newAngle = getAngleBetweenTwoPoints(
            touchPositions[0] as [number, number],
            touchPositions[1] as [number, number]
          );
          // Delta angle between the original angle the one that we're projecting
          deltaAngle = newAngle - startAngle;

          console.log('startAngle', startAngle);

          // This method will project a point on the canvas using the already known scale and its delta
          function projectPosScaled(x: number, y: number) {
            return [
              offset.value.left + canvasNaturalWidth.value * x * naturalScale.value * futureScale + scaleDeltaX,
              offset.value.top + canvasNaturalHeight.value * y * naturalScale.value * futureScale + scaleDeltaY,
            ] as [number, number];
          }

          // Normal 0,0 position
          const originPointProjectionWithoutRotation = projectPosScaled(0, 0);
          // Anchor point
          const anchorPointProjectionWithoutRotation = projectPosScaled(
            touchStarts[0].canvasRel[0],
            touchStarts[0].canvasRel[1]
          );
          // Origin point with rotation
          const originPointProjectionWithRotation = rotatePoint(
            originPointProjectionWithoutRotation,
            anchorPointProjectionWithoutRotation,
            deltaAngle
          );

          // Calculate the difference between the original and the rotated point
          rotationDeltaX = originPointProjectionWithRotation[0] - originPointProjectionWithoutRotation[0];
          rotationDeltaY = originPointProjectionWithRotation[1] - originPointProjectionWithoutRotation[1];
        }

        // Set the new values
        scale.value = futureScale;
        rotate.value = deltaAngle;
        translate.value = [scaleDeltaX + rotationDeltaX, scaleDeltaY + rotationDeltaY];

        console.log('scale', scale.value);
        console.log('rotate', rotate.value);
        console.log('translate', translate.value[0], translate.value[1]);
      } else {
        // Single finger touch implementation
        const deltaX = event.touches[0].clientX - touchStarts[0].client[0];
        const deltaY = event.touches[0].clientY - touchStarts[0].client[1];
        const futureTranslate = [touchStartTranslate[0] + deltaX, touchStartTranslate[1] + deltaY];
        // Set the new values
        translate.value = futureTranslate as [number, number];
      }
    }
  };
  const handleTouchend = (event: TouchEvent) => {
    const isWithinMatrix = (event.target as HTMLElement).closest('.matrix') !== null;
    if (isWithinMatrix) {
      return;
    }

    if (event.touches.length === 0) {
      touchStarts = null;
    } else {
      touchStarts = freezeTouches(event.touches);
      touchStartScale = scale.value;
      touchStartTranslate = [translate.value[0], translate.value[1]];
      touchStartRotate = rotate.value;
    }
  };

  return {
    handleTouchstart,
    handleTouchmove,
    handleTouchend,
  };
}
