## Zoompinch

Apply a pinch-and-zoom experience that’s feels native and communicates the transform reactively and lets you project any layer on top of the transformed canvas.

**Play around with the [demo here](https://zoompinch.pages.dev)**

![Mobile demo](https://zoompinch.pages.dev/zoompinch_demo.gif)

### Mathematical correct pinch on touch

Unlike other libraries, _Zoompinch_ does not just uses the center point between two fingers as projection center. The fingers get correctly projected on the virtual canvas. This makes pinching on touch devices feel native-like.

### Touch, Wheelm, Mouse and Trackpad Gestures!

Adside of touch, mouse and wheel events, **gesture events** (Safari Desktop) are supported as well! Try it out on the [demo](https://zoompinch.pages.dev)

### Currently supported platforms:

- [x] Vue 3
- [ ] Web components (work in progress)
- [ ] React

### Install

```bash
$ npm install zoompinch
```

### Example usage

```vue
<zoompinch
  ref="zoompinchRef"
  v-model:transform="transform"
  :width="1536"
  :height="2048"
  :offset="{ top: 10, right: 10, bottom: 10, left: 10 }"
  :min-scale="0.1"
  :max-scale="10"
  :rotation="true"
  :bounds="false"
  mouse
  touch
  wheel
  gesture
>
  <template #canvas>
    <img src="https://imagedelivery.net/mudX-CmAqIANL8bxoNCToA/489df5b2-38ce-46e7-32e0-d50170e8d800/public" style="width: 1536px; height: 2048px;" />
  </template>
  <template #matrix="{ composePoint }">
    <svg xmlns="http://www.w3.org/2000/svg" @click="handleClickOnLayer">
      <!-- This circle will stick to the center of the canvas -->
      <circle :cx="composePoint(0.5, 0.5)[0]" :cx="composePoint(0.5, 0.5)[1]" r="5" style="fill: #f00;" />
    </svg>
  </template>
</zoompinch>
```

```typescript
import { Zoompinch } from 'zoompinch';
import 'zoompich/style.css';

// Just the ref instance in which the component instance will live
const zoompinchRef = ref<InstanceType<typeof ProjectionLayer>>();

// A reactive transform object
const transform = ref({
  x: 0,
  y: 0,
  scale: 1,
  rotate: 1,
});

function handleClickOnLayer(event: MouseEvent) {
  const [x, y] = zoompinchRef.value?.normalizeMatrixCoordinates(event.clientX, event.clientY);

  console.log('clicked at', x, y);
}
```

#### Properties

- `width` and `height`: Just inner dimensions of the element in the canvas.In fact they have to fit the aspect ratio of the actual element (otherwise you will have offsets)
- `offset`: A padding that affects the "real view box" that will be used for calculations. This is important because of course the initial scale of `1` such as the initial translate of `0, 0` will be affected by this offset. Fitting your canvas into `{ scale: 1, x: 0, y: 0, rotate: 0 }` will be always the center of the view box without the offset.
- `transform`: A reactive property (that can be used via `v-model`) that holds and accepts the relative transform from the center
- `minScale` and `maxScale`: Minimum and maximum scale
- `bounds`: Boolean value wether the canvas whould fit into the bounds of the view layer. If there is an offset, it will stick to the center. Default is `false`
- `rotation`: Boolean value wether rotation is enabled. Default is `true`
- `mouse`: Boolean value, wether mouse events will be connected
- `touch`: Boolean value, wether touch events will be connected
- `wheel`: Boolean value wether wheel events will be connected
- `gesture`: Boolean value, wether gesture events will be connected

## Helper functions

Because different use cases need different ways of modifying a transform, there exist a lot of helper functions

The most easiest way to interact with the transformations is to use the reactive transform object.

```typescript
console.log(transform.value);
/*
{
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0 
}
*/

transform.value = { x: 42, y: -42, scale: 1.5, rotate: 45 };
```

### applyTransform

The `applyTransform` function accepts a given scale, a given relative position within the canvas, a relative position within the layer view and scales + positions the canvas.

Make the canvas be centered at scale 1

```typescript
applyTransform(1, [0.5, 0.5], [0.5, 0.5]);
```

Make the center of the canvas be at top-bottom of the layer

```typescript
applyTransform(1, [0.5, 0.5], [1, 1]);
```

### rotateCanvas

The `rotateCanvas` function accepts a relative x and y anchor within the canvas and a given rotation in radians. The canvas will be rotated around the relative anchor.

Rotate canvas around its center

```typescript
rotateCanvas(0.5, 0.5, Math.PI / 4);
```

### normalizeMatrixCoordinates

The `normalizeMatrixCoordinates` method convert given clientX and clientY coordinates to relative inner-canvas coordinates

```typescript
normalizeMatrixCoordinates(event.clientX, event.clientY);
```

### composePoint

The `composePoint` returns absolute coordinates within the layer (from 0,0) for given relative inner-canvas coordinates.

Example usage:

```vue
<!-- ... -->
<template #matrix="{ composePoint }">
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <!-- This circle would stick to the center of the canvas -->
    <circle :cx="composePoint(0.5, 0.5)[0]" :cy="composePoint(0.5, 0.5)[1]" />
  </svg>
</template>
<!-- ... -->
```
