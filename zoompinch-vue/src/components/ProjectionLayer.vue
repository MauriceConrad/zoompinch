<template>
  <div
    ref="projectionLayerRef"
    class="projection-layer"
    :style="{
      '--canvas-width': `${width}px`,
      '--canvas-height': `${height}px`,
      '--canvas-ratio': width / height,
      '--rendering-scale': renderingScale,
      '--translate-x': `${renderingTranslate[0]}px`,
      '--translate-y': `${renderingTranslate[1]}px`,
      '--rotate': `${radiansToDegrees(renderingRotate)}deg`,
      '--offset-top': `${props.offset.top}px`,
      '--offset-right': `${props.offset.right}px`,
      '--offset-bottom': `${props.offset.bottom}px`,
      '--offset-left': `${props.offset.left}px`,
      '--transition-duration': `${transitionDuration}s`,
    }"
    :class="{
      'transition-enabled': transitionEnabled,
    }"
    @wheel="wheelProxy"
    @touchstart="touchstartProxy"
    @mousedown="mousedownProxy"
    @gesturestart="handleGesturestart"
  >
    <div ref="canvasRef" class="canvas">
      <slot name="canvas" />
    </div>
    <div ref="matrixRef" class="matrix">
      <!-- <div class="offset-rect"></div>
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <circle :cx="composePoint(0, 0)[0]" :cy="composePoint(0, 0)[1]" r="5" />
        <circle :cx="composePoint(1, 0)[0]" :cy="composePoint(1, 0)[1]" r="5" />
        <circle :cx="composePoint(1, 1)[0]" :cy="composePoint(1, 1)[1]" r="5" />
        <circle :cx="composePoint(0, 1)[0]" :cy="composePoint(0, 1)[1]" r="5" />
      </svg> -->
      <slot name="matrix" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useZoom } from '../controllers/zoom';
import { ref, defineProps, toRef, computed, onMounted, watch, toRefs, onUnmounted, reactive } from 'vue';
import _ from 'lodash';
import { radiansToDegrees } from '../controllers/helpers';

export type Transform = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
};

const props = withDefaults(
  defineProps<{
    transform?: Transform;
    width: number;
    height: number;
    offset?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    maxScale?: number;
    minScale?: number;
    bounds?: boolean;
    rotation?: boolean;
    mouse?: boolean;
    wheel?: boolean;
    touch?: boolean;
  }>(),
  {
    transform: () => ({ x: 0, y: 0, scale: 1, rotate: 0 }),
    offset: () => ({ left: 0, top: 0, right: 0, bottom: 0 }),
    minScale: 0.5,
    maxScale: 10,
    bounds: false,
    rotation: true,
    mouse: true,
    wheel: true,
    touch: true,
  }
);
const emit = defineEmits<{
  'update:transform': [transform: Transform];
}>();

const projectionLayerRef = ref<HTMLElement>();
const canvasRef = ref<HTMLElement>();
const matrixRef = ref<HTMLElement>();

const canvasNaturalWidth = toRef(props, 'width');
const canvasNaturalHeight = toRef(props, 'height');
const offset = toRef(props, 'offset');

const rotationEnabled = computed(() => {
  return !props.bounds && props.rotation;
});

const {
  renderingTranslate,
  renderingRotate,
  renderingScale,
  composePoint,
  handleWheel,
  handleMousedown,
  handleMousemove,
  handleMouseup,
  handleTouchstart,
  handleTouchmove,
  handleTouchend,
  handleGesturestart,
  handleGesturechange,
  handleGestureend,
  applyTransform,
  rotateCanvas,
  exposedTransform,
  calcProjectionTranslate,
  clientCoordinatesToCanvasCoordinates,
  wrapperBounds,
  transitionEnabled,
  transitionDuration,
} = useZoom({
  wrapperElementRef: projectionLayerRef,
  canvasNaturalWidth,
  canvasNaturalHeight,
  offset,
  rotationEnabled,
  minScale: toRef(props, 'minScale'),
  maxScale: toRef(props, 'maxScale'),
});

watch(exposedTransform, () => {
  if (
    props.transform.rotate !== exposedTransform.value.rotate ||
    props.transform.scale !== exposedTransform.value.scale ||
    props.transform.x !== exposedTransform.value.x ||
    props.transform.y !== exposedTransform.value.y
  ) {
    emit('update:transform', exposedTransform.value);
  }
});

watch(
  () => props.transform,
  () => {
    if (
      props.transform.x !== exposedTransform.value.x ||
      props.transform.y !== exposedTransform.value.y ||
      props.transform.scale !== exposedTransform.value.scale ||
      props.transform.rotate !== exposedTransform.value.rotate
    ) {
      exposedTransform.value = {
        x: props.transform.x,
        y: props.transform.y,
        scale: props.transform.scale,
        rotate: props.transform.rotate,
      };
    }
  },
  { deep: true }
);
onMounted(() => {
  exposedTransform.value = {
    x: props.transform.x,
    y: props.transform.y,
    scale: props.transform.scale,
    rotate: props.transform.rotate,
  };
});

const wheelProxy = (event: WheelEvent) => {
  if (props.wheel) {
    handleWheel(event);
  }
};
const touchstartProxy = (event: TouchEvent) => {
  if (props.touch) {
    handleTouchstart(event);
  }
};
const touchmoveProxy = (event: TouchEvent) => {
  if (props.touch) {
    handleTouchmove(event);
  }
};
const touchendProxy = (event: TouchEvent) => {
  if (props.touch) {
    handleTouchend(event);
  }
};
const mousedownProxy = (event: MouseEvent) => {
  if (props.mouse) {
    handleMousedown(event);
  }
};
const mousemoveProxy = (event: MouseEvent) => {
  if (props.mouse) {
    handleMousemove(event);
  }
};
const mouseupProxy = (event: MouseEvent) => {
  if (props.mouse) {
    handleMouseup(event);
  }
};

window.addEventListener('touchmove', touchmoveProxy);
window.addEventListener('touchend', touchendProxy);
window.addEventListener('mouseup', mouseupProxy);
window.addEventListener('mousemove', mousemoveProxy);
window.addEventListener('gesturechange', handleGesturechange);
window.addEventListener('gestureend', handleGestureend);
onUnmounted(() => {
  window.removeEventListener('touchmove', touchmoveProxy);
  window.removeEventListener('touchend', touchendProxy);
  window.removeEventListener('mouseup', mouseupProxy);
  window.removeEventListener('mousemove', mousemoveProxy);
  window.removeEventListener('gesturechange', handleGesturechange);
  window.removeEventListener('gestureend', handleGestureend);
});

defineExpose({
  composePoint,
  clientCoordinatesToCanvasCoordinates,
  applyTransform,
  calcProjectionTranslate,
  rotateCanvas,
  wrapperBounds,
});
</script>

<style scoped lang="scss">
.projection-layer {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  touch-action: none;
  .canvas {
    position: absolute;
    left: 0px;
    top: 0px;
    width: var(--canvas-width);
    height: var(--canvas-height);
    transform-origin: 0% 0%;
    transform: translate(var(--translate-x), var(--translate-y)) scale(var(--rendering-scale)) rotate(var(--rotate));
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-drag: none;
    -webkit-user-drag: none;
    -moz-user-drag: none;
    ::v-deep(img) {
      pointer-events: none;
    }
  }
  &.transition-enabled {
    .canvas {
      transition: transform var(--transition-duration);
    }
  }

  .matrix {
    left: 0px;
    top: 0px;
    position: absolute;
    width: 100%;
    height: 100%;
    > ::v-deep(*) {
      width: 100%;
      height: 100%;
    }
    .offset-rect {
      position: absolute;
      background-color: rgba(255, 0, 0, 0.1);
      left: var(--offset-left);
      top: var(--offset-top);
      width: calc(100% - var(--offset-left) - var(--offset-right));
      height: calc(100% - var(--offset-top) - var(--offset-bottom));
    }
  }
}
</style>
