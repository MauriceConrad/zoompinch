import { Ref } from 'vue';
import { clamp } from './helpers';

export function detectTrackpad(event: WheelEvent) {
  var isTrackpad = false;
  if ((event as any).wheelDeltaY) {
    if ((event as any).wheelDeltaY === event.deltaY * -3) {
      isTrackpad = true;
    }
  } else if (event.deltaMode === 0) {
    isTrackpad = true;
  }
  return isTrackpad;
}
export function isMultipleOf(n: number, multiples: number[]) {
  const factor = multiples.find((m) => n % m === 0);
  if (factor) {
    return n / factor;
  } else {
    return n;
  }
}

export function useWheel({
  scale,
  translate,
  minScale,
  maxScale,
  relativeWrapperCoordinatesFromClientCoords,
  normalizeMatrixCoordinates,
  calcProjectionTranslate,
}: {
  scale: Ref<number>;
  translate: Ref<[number, number]>;
  minScale: Ref<number>;
  maxScale: Ref<number>;
  relativeWrapperCoordinatesFromClientCoords: (clientX: number, clientY: number) => [number, number];
  normalizeMatrixCoordinates: (clientX: number, clientY: number) => [number, number];
  calcProjectionTranslate: (
    newScale: number,
    wrapperPosition: [number, number],
    canvasPosition: [number, number]
  ) => [number, number];
}) {
  function handleWheel(event: WheelEvent) {
    let { deltaX, deltaY, ctrlKey } = event;
    const mouseMultiples = [120, 100];
    const mouseFactor = 4;
    if (Math.abs(deltaX)) {
    }
    if (isMultipleOf(deltaX, mouseMultiples)) {
      deltaX = deltaX / ((100 / mouseFactor) * isMultipleOf(deltaX, mouseMultiples));
    }
    if (isMultipleOf(deltaY, mouseMultiples)) {
      deltaY = deltaY / ((100 / mouseFactor) * isMultipleOf(deltaY, mouseMultiples));
    }
    const currScale = scale.value;
    if (ctrlKey) {
      const scaleDelta = (-deltaY / 100) * currScale;
      const newScale = clamp(currScale + scaleDelta, minScale.value, maxScale.value);

      const [translateX, translateY] = calcProjectionTranslate(
        newScale,
        relativeWrapperCoordinatesFromClientCoords(event.clientX, event.clientY),
        normalizeMatrixCoordinates(event.clientX, event.clientY)
      );

      translate.value = [translateX, translateY];
      scale.value = newScale;
    } else {
      translate.value = [translate.value[0] - deltaX, translate.value[1] - deltaY];
    }

    event.preventDefault();
    event.stopPropagation();
  }

  return {
    handleWheel,
  };
}
