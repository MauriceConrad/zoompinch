import { Ref } from 'vue';
import { degreeToRadians } from './helpers';

export function useGesture(
  rotate: Ref<number>,
  rotationEnabled: Ref<boolean>,
  rotateCanvas: (x: number, y: number, angle: number) => void,
  normalizeMatrixCoordinates: (clientX: number, clientY: number) => [number, number]
) {
  let gestureStartRotation = 0;
  const handleGesturestart = (event: UIEvent) => {
    gestureStartRotation = rotate.value;
  };
  const handleGesturechange = (event: any) => {
    if (rotationEnabled.value === false) {
      return;
    }
    const currRotation = (event as any).rotation as number;
    if (currRotation === 0) {
      return;
    }

    const relPos = normalizeMatrixCoordinates(event.clientX, event.clientY);
    rotateCanvas(relPos[0], relPos[1], gestureStartRotation + degreeToRadians(currRotation));
  };
  const handleGestureend = (event: any) => {
    //console.log('gestureend', event);
  };

  return {
    handleGesturestart,
    handleGesturechange,
    handleGestureend,
  };
}
