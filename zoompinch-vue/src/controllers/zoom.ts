import { Ref, computed, nextTick, ref, watch } from 'vue';
import { useElementBounding } from '@vueuse/core';
import { useTouch } from './touch';
import { useWheel } from './wheel';
import { useMouse } from './mouse';
import { useGesture } from './gesture';
import { clamp, degreeToRadians, radiansToDegrees, rotatePoint, round } from '../controllers/helpers';

export function useZoom({
  wrapperElementRef,
  canvasNaturalWidth,
  canvasNaturalHeight,
  offset,
  bounds,
  rotationEnabled,
  minScale,
  maxScale,
}: {
  wrapperElementRef: Ref<HTMLElement | undefined>;
  canvasNaturalWidth: Ref<number>;
  canvasNaturalHeight: Ref<number>;
  offset: Ref<{ top: number; left: number; right: number; bottom: number }>;
  bounds: Ref<boolean>;
  rotationEnabled: Ref<boolean>;
  minScale: Ref<number>;
  maxScale: Ref<number>;
}) {
  // Get the wrapper element's bounding box
  const { x: wrapperX, y: wrapperY, width: wrapperWidth, height: wrapperHeight } = useElementBounding(wrapperElementRef);

  const wrapperBounds = computed(() => {
    return {
      x: wrapperX.value,
      y: wrapperY.value,
      width: wrapperWidth.value,
      height: wrapperHeight.value,
    };
  });

  // Calculate the inner wrapper dimensions (excluding padding)
  const wrapperInnerX = computed(() => {
    return wrapperX.value + offset.value.left;
  });
  const wrapperInnerY = computed(() => {
    return wrapperY.value + offset.value.top;
  });
  const wrapperInnerWidth = computed(() => {
    return wrapperWidth.value - offset.value.left - offset.value.right;
  });
  const wrapperInnerHeight = computed(() => {
    return wrapperHeight.value - offset.value.top - offset.value.bottom;
  });

  // Calculate the aspect ratio of the wrapper and canvas
  const wrapperInnerRatio = computed(() => {
    return wrapperInnerWidth.value / wrapperInnerHeight.value;
  });
  const canvasNaturalRatio = computed(() => {
    return canvasNaturalWidth.value / canvasNaturalHeight.value;
  });

  // This is the scale we need to apply to the canvas to make it fit the wrapper
  const naturalScale = computed(() => {
    if (canvasNaturalRatio.value >= wrapperInnerRatio.value) {
      return wrapperInnerWidth.value / canvasNaturalWidth.value;
    } else {
      return wrapperInnerHeight.value / canvasNaturalHeight.value;
    }
  });

  const translate = (() => {
    const _translateX = ref(0);
    const _translateY = ref(0);

    return computed({
      get() {
        return [_translateX.value, _translateY.value] as [number, number];
      },
      set([newTranslateX, newTranslateY]) {
        const overflowX = canvasNaturalWidth.value * renderingScale.value - wrapperInnerWidth.value;
        const overflowY = canvasNaturalHeight.value * renderingScale.value - wrapperInnerHeight.value;

        if (rotationEnabled.value || !bounds.value) {
          _translateX.value = newTranslateX;
          _translateY.value = newTranslateY;
        } else {
          // Calculate the overflow of the canvas
          const borderLeft = -overflowX;
          const borderRight = Math.max(0, -overflowX / 2);

          const borderTop = -overflowY;
          const borderBottom = Math.max(0, -overflowY / 2);

          _translateX.value = clamp(newTranslateX, borderLeft, borderRight);
          _translateY.value = clamp(newTranslateY, borderTop, borderBottom);
        }
      },
    });
  })();
  const scale = (() => {
    const _scale = ref(1);
    return computed({
      get() {
        return _scale.value;
      },
      set(newScale) {
        _scale.value = clamp(newScale, minScale.value, maxScale.value);
      },
    });
  })();
  const rotate = (() => {
    const _rotate = ref(0);
    return computed({
      get() {
        return _rotate.value;
      },
      set(newRotate) {
        _rotate.value = newRotate;
      },
    });
  })();

  const renderingScale = computed(() => {
    return scale.value * naturalScale.value;
  });
  const renderingTranslate = computed(() => {
    return [offset.value.left + translate.value[0], offset.value.top + translate.value[1]];
  });

  const renderingRotate = computed(() => {
    return rotate.value;
  });

  const transitionEnabled = ref(false);
  const transitionDuration = ref(0.3);
  let transitionEnabledProtected = false;

  function applyTransform(
    newScale: number,
    wrapperInnerCoords: [number, number],
    canvasAnchorCoords: [number, number],
    animate = false
  ) {
    const scaleTranslation = calcProjectionTranslate(newScale, wrapperInnerCoords, canvasAnchorCoords, 0);
    scale.value = newScale;
    translate.value = scaleTranslation;
    transitionEnabled.value = animate;
    transitionEnabledProtected = true;
    // Wait for the next tick to disable the transition protection
    nextTick(() => {
      transitionEnabledProtected = false;
    });
    setTimeout(() => {
      transitionEnabled.value = false;
    }, transitionDuration.value * 1000);
  }

  watch([renderingRotate, renderingScale, renderingTranslate], () => {
    if (!transitionEnabledProtected) {
      transitionEnabled.value = false;
    }
  });

  function getCenterOffset(scale: number, translate: [number, number], rotate: number) {
    const centeredTranslationOffset = calcProjectionTranslate(scale, [0.5, 0.5], [0.5, 0.5], 0);
    const centeredPointNormal = [
      offset.value.left + centeredTranslationOffset[0] + canvasNaturalWidth.value * (scale * naturalScale.value) * 0.5,
      offset.value.top + centeredTranslationOffset[1] + canvasNaturalHeight.value * (scale * naturalScale.value) * 0.5,
    ];
    const composedPoint = composePoint(0.5, 0.5, scale, translate, rotate);

    const diffX = composedPoint[0] - centeredPointNormal[0];
    const diffY = composedPoint[1] - centeredPointNormal[1];

    return [diffX, diffY];
  }

  function getTransform() {
    const offset = getCenterOffset(scale.value, [0, 0], rotate.value);
    return {
      x: round(translate.value[0] + offset[0], 6),
      y: round(translate.value[1] + offset[1], 6),
      scale: round(scale.value, 6),
      rotate: round(radiansToDegrees(rotate.value), 6),
    };
  }

  const exposedTransform = computed({
    get() {
      return getTransform();
    },
    set(newTransform) {
      const __curTransform = getTransform();
      if (
        newTransform.x === __curTransform.x &&
        newTransform.y === __curTransform.y &&
        newTransform.scale === __curTransform.scale &&
        newTransform.rotate === __curTransform.rotate
      ) {
        return;
      }
      const radians = degreeToRadians(newTransform.rotate);
      const offset = getCenterOffset(newTransform.scale, [0, 0], radians);
      translate.value = [newTransform.x - offset[0], newTransform.y - offset[1]];
      scale.value = newTransform.scale;
      rotate.value = radians;
    },
  });
  // Converts absolute client to coordinates to absolute inner-wrapper coorinates
  function clientCoordsToWrapperCoords(clientX: number, clientY: number) {
    return [clientX - wrapperInnerX.value, clientY - wrapperInnerY.value] as [number, number];
  }
  // Converts absolute client coordinates to relative wrapper coordinates (0-1, 0-1)
  function relativeWrapperCoordinatesFromClientCoords(clientX: number, clientY: number) {
    const [x, y] = clientCoordsToWrapperCoords(clientX, clientY);
    return [x / wrapperInnerWidth.value, y / wrapperInnerHeight.value] as [number, number];
  }
  // Converts absolute inner wrapper coordinates to relative canvas coordinates (0-1, 0-1)
  function getCanvasCoords(x: number, y: number) {
    // Anchor is relative wrapper inner 0,0
    const anchor = [0, 0] as [number, number];
    // Untranslate the point
    const untranslatedPoint = [x - translate.value[0], y - translate.value[1]] as [number, number];
    // Unrotate the point
    const unrotatedPoint = rotatePoint(untranslatedPoint, anchor, -rotate.value);
    // Unscale the point
    const unscaledPoint = [unrotatedPoint[0] / renderingScale.value, unrotatedPoint[1] / renderingScale.value];
    // Return the point relative to the canvas natural size
    const pointRel = [unscaledPoint[0] / canvasNaturalWidth.value, unscaledPoint[1] / canvasNaturalHeight.value] as [
      number,
      number
    ];
    return pointRel;
  }
  // Converts client coordinates to relative canvas coordinates (0-1, 0-1)
  function normalizeMatrixCoordinates(clientX: number, clientY: number) {
    const innerWrapperCoords = clientCoordsToWrapperCoords(clientX, clientY);
    return getCanvasCoords(innerWrapperCoords[0], innerWrapperCoords[1]);
  }
  // Converts client coordinates to absolute canvas coordinates
  function clientCoordinatesToCanvasCoordinates(clientX: number, clientY: number) {
    const [relX, relY] = normalizeMatrixCoordinates(clientX, clientY);
    return [relX * canvasNaturalWidth.value, relY * canvasNaturalHeight.value] as [number, number];
  }

  // Projects a point on the canvas to the wrapper
  function composePoint(x: number, y: number, currScale?: number, currTranslate?: [number, number], currRotate?: number) {
    currScale = currScale ?? scale.value;
    currTranslate = currTranslate ?? (translate.value as [number, number]);
    currRotate = currRotate ?? rotate.value;

    // Anchor is 0, 0
    const anchor = [offset.value.left, offset.value.top] as [number, number];
    // Scale the point
    const scaledPoint = [
      offset.value.left + canvasNaturalWidth.value * (currScale * naturalScale.value) * x,
      offset.value.top + canvasNaturalHeight.value * (currScale * naturalScale.value) * y,
    ] as [number, number];
    // Rotate around the anchor
    const rotatedPoint = rotatePoint(scaledPoint, anchor, currRotate);
    // Translate straightforward
    const translatedPoint = [rotatedPoint[0] + currTranslate[0], rotatedPoint[1] + currTranslate[1]] as [number, number];

    return translatedPoint;
  }

  function compose(x: number, y: number) {
    const relX = x / canvasNaturalWidth.value;
    const relY = y / canvasNaturalHeight.value;
    return composePoint(relX, relY);
  }

  // Helper function that calculates the translation needed to map a point on the canvas to a point on the wrapper
  function calcProjectionTranslate(
    newScale: number,
    wrapperPosition: [number, number],
    canvasPosition: [number, number],
    virtualRotate?: number
  ) {
    // Calculate the intrinsic dimensions of the canvas
    const canvasIntrinsicWidth = canvasNaturalWidth.value * naturalScale.value;
    const canvasIntrinsicHeight = canvasNaturalHeight.value * naturalScale.value;
    // Calculate the real x,y coordinates of the canvas
    const canvasRealX = canvasPosition[0] * canvasIntrinsicWidth * newScale;
    const canvasRealY = canvasPosition[1] * canvasIntrinsicHeight * newScale;
    const canvsRealRotated = rotatePoint([canvasRealX, canvasRealY], [0, 0], virtualRotate ?? rotate.value);
    // Calculate the real dimensions of the wrapper
    const wrapperRealX = wrapperPosition[0] * wrapperInnerWidth.value;
    const wrapperRealY = wrapperPosition[1] * wrapperInnerHeight.value;
    // Calculate the delta between the canvas and the wrapper
    const deltaX = wrapperRealX - canvsRealRotated[0];
    const deltaY = wrapperRealY - canvsRealRotated[1];

    return [deltaX, deltaY] as [number, number];
  }

  function rotateCanvas(x: number, y: number, radians: number) {
    const newRotate = radians; // rotate.value + radians;
    const offset = getCenterOffset(scale.value, [0, 0], newRotate);
    const centeredTranslate = [0 - offset[0], 0 - offset[1]] as [number, number];
    const centeredScale = scale.value;
    const centeredRotate = newRotate;
    const virtualPoint = composePoint(x, y, centeredScale, centeredTranslate, centeredRotate);
    const currPoint = composePoint(x, y);
    const deltaX = currPoint[0] - virtualPoint[0];
    const deltaY = currPoint[1] - virtualPoint[1];
    translate.value = [centeredTranslate[0] + deltaX, centeredTranslate[1] + deltaY] as [number, number];
    rotate.value = newRotate;
  }

  const { handleTouchend, handleTouchmove, handleTouchstart } = useTouch({
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
  });

  const { handleWheel } = useWheel({
    scale,
    translate,
    minScale,
    maxScale,
    relativeWrapperCoordinatesFromClientCoords,
    normalizeMatrixCoordinates,
    calcProjectionTranslate,
  });

  const { handleMousedown, handleMouseup, handleMousemove } = useMouse(translate);

  const { handleGesturestart, handleGesturechange, handleGestureend } = useGesture(
    rotate,
    rotationEnabled,
    rotateCanvas,
    normalizeMatrixCoordinates
  );

  return {
    handleTouchend,
    handleTouchmove,
    handleTouchstart,
    handleGesturestart,
    handleGesturechange,
    handleGestureend,
    translate,
    scale,
    rotate,
    renderingScale,
    renderingTranslate,
    renderingRotate,
    exposedTransform,
    rotateCanvas,
    calcProjectionTranslate,
    clientCoordsToWrapperCoords,
    getCanvasCoords,
    normalizeMatrixCoordinates,
    clientCoordinatesToCanvasCoordinates,
    composePoint,
    compose,
    handleWheel,
    applyTransform,
    handleMousedown,
    handleMouseup,
    handleMousemove,
    wrapperBounds,
    transitionEnabled,
    transitionDuration,
    wrapperX,
    wrapperY,
    wrapperWidth,
    wrapperHeight,
  };
}
