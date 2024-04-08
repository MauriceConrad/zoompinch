# Projection Layer

This vue component provides a layer that projects any coordinates into the real rendeirng viewbox of the canvas. It also provides a straight forward integration of panzoom.

## Example


```html
<projection-layer :x="0" :y="0" :width="600" :height="400" panzoom>
  <template #canvas>
    <img src="this/image/is/400/with/and/600/height.png" style="height: 100%; width: 100%;" />
  </template>
  <template #matrix="{ compose, normalizeMatrixCoordinates }">
    <svg xmlns="http://www.w3.org/2000/svg">
      <!--
        This projects a rectangle at 10,10 width 100,100 size over the image.
      -->
      <rect :x="compose.x(10)" :y="compose.y(10)" :width="compose.size(100)" :height="compose.size(100)"/>
    </svg>
  </template>
</projection-layer>
```

## Properties

- `width` & `height`: Width & height of the projecting matrix. Shold be the same as the image you are projecting
- `x` & `y`: X and Y offset of the projecting matrix (should be `0` in mos of the cases)
- `panzoom`: Wether to init panzoom wheel events

## Slots

### Canvas

The canvas. The wrapping container of this slot will always have the aspect ratio of `width` / `height`, so the graphic within fill up `100%` and `100%` of it without offsets, otherwise the contenst within `#matrix` it will not be projedcted correctly.

### Matrix

THis wraps the matrix projection and directly give access to `compose` and `normalizeMatrixCoordinates`

#### Variables

- `compose`:
  `x`: Function that converts a x coordinate within the matrix to the "real" coordinate within the layer
  `y`: Function that converts a y coordinate within the matrix to the "real" coordinate within the layer
  `size`: Function that converts a size within the matrix to the "real" size within the layer
- `normalizeMatrixCoordinates`: Accepts `clientX` and `clientY` coordinates and returns their matrix coordinates
  - **Example:** `normalizeMatrixCoordinates(event.clientX, event.clientY)`

## Exposed

- `compose`:
  `x`: Function that converts a x coordinate within the matrix to the "real" coordinate within the layer
  `y`: Function that converts a y coordinate within the matrix to the "real" coordinate within the layer
  `size`: Function that converts a size within the matrix to the "real" size within the layer
  
### `normalizeMatrixCoordinates()`:

Accepts `clientX` and `clientY` coordinates and returns their matrix coordinates

**Example:** `normalizeMatrixCoordinates(event.clientX, event.clientY)`



### `applyTransform()`

Accepts `x`, `y`, `scale`, `origin` and `anchor` which scales and pans the canvas and the matrix. The `origin` is the origin within the main container while the `anchor` is the internal anchor point of the canvas.

Center the canvas at scale `2`: `applyTransform(0, 0, 2, [0.5, 0.5], [0.5, 0.5])`

### `compose`

Object that contains the compose functions.

- `x`: Function that converts a x coordinate within the matrix to the "real" coordinate within the layer
- `y`: Function that converts a y coordinate within the matrix to the "real" coordinate within the layer
- `size`: Function that converts a size within the matrix to the "real" size within the layer

