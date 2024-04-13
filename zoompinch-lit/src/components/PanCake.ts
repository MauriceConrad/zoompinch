import { LitElement, PropertyValueMap, css, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './PanCake.scss';
import { rotatePoint } from '../util/vector';
import { clamp, degreeToRadians, getAngleBetweenTwoPoints } from '../util/helpers';

@customElement('pan-cake')
export class PanCake extends LitElement {
  static styles = unsafeCSS(styles as any);
  @property({ type: Number })
  width = 1000;
  @property({ type: Number })
  height = 1000;
  @property({ type: Number })
  offsetLeft = 0;
  @property({ type: Number })
  offsetTop = 0;
  @property({ type: Number })
  offsetRight = 0;
  @property({ type: Number })
  offsetBottom = 0;
  @property({ type: Number })
  translateX = 0;
  @property({ type: Number })
  translateY = 0;
  @property({ type: Number })
  scale = 1;
  @property({ type: Number })
  rotate = 0;
  @property({ type: Number })
  minScale = 0.5;
  @property({ type: Number })
  maxScale = 10;
  @property({ type: Boolean })
  bounds = false;
  @property({ type: Boolean })
  allowRotation = true;

  public test() {
    console.log('test');
  }

  render() {
    return html`
      <div
        class="pan-cake"
        style="--canvas-width: ${this.width}px; --canvas-height: ${this.height}px; --scale: ${this.renderingScale}; --translate-x: ${this.renderingTranslateX}px; --translate-y: ${this.renderingTranslateY}px; --rotate: ${this.renderingRotate}deg;"
      >
        <div class="canvas">
          <slot name="canvas"></slot>
        </div>
        <div class="matrix">
          <slot name="matrix"></slot>
        </div>
      </div>
    `;
  }
  get _wrapper() {
    return this.renderRoot.querySelector('.pan-cake');
  }
  get _canvasWrapper() {
    return this.renderRoot.querySelector('.canvas');
  }
  get _matrixWrapper() {
    return this.renderRoot.querySelector('.matrix');
  }
  @property({ type: DOMRectReadOnly })
  private wrapperBounds: DOMRectReadOnly | undefined;
  private resizeObserver!: ResizeObserver;
  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (!this._wrapper) {
      return console.error('No wrapper found');
    }
    this.resizeObserver = new ResizeObserver((entries) => {
      this.wrapperBounds = entries[0].contentRect;
    });
    this.resizeObserver.observe(this._wrapper);
  }

  private get canvasNaturalRatio() {
    return this.width / this.height;
  }

  private get wrapperInnerX() {
    return this.offsetLeft + (this.wrapperBounds?.x ?? 0);
  }
  private get wrapperInnerY() {
    return this.offsetTop + (this.wrapperBounds?.y ?? 0);
  }
  private get wrapperInnerWidth() {
    return (this.wrapperBounds?.width ?? 0) - this.offsetLeft - this.offsetRight;
  }
  private get wrapperInnerHeight() {
    return (this.wrapperBounds?.height ?? 0) - this.offsetTop - this.offsetBottom;
  }
  private get wrapperInnerRatio() {
    return this.wrapperInnerWidth / this.wrapperInnerHeight;
  }

  get naturalScale() {
    if (this.canvasNaturalRatio >= this.wrapperInnerRatio) {
      return this.wrapperInnerWidth / this.width;
    } else {
      return this.wrapperInnerHeight / this.height;
    }
  }

  private get renderingScale() {
    return this.scale * this.naturalScale;
  }
  private get renderingTranslateX() {
    return this.offsetLeft + this.translateX;
  }
  private get renderingTranslateY() {
    return this.offsetTop + this.translateY;
  }
  private get renderingRotate() {
    return this.rotate;
  }
  static clientCoordsToWrapperCoords(clientX: number, clientY: number, wrapperInnerX: number, wrapperInnerY: number) {
    return [clientX - wrapperInnerX, clientY - wrapperInnerY] as [number, number];
  }
  clientCoordsToWrapperCoords(clientX: number, clientY: number) {
    return PanCake.clientCoordsToWrapperCoords(clientX, clientY, this.wrapperInnerX, this.wrapperInnerY);
  }
  static relativeWrapperCoordinatesFromClientCoords(clientX: number, clientY: number, wrapperInnerX: number, wrapperInnerY: number, wrapperInnerWidth: number, wrapperInnerHeight: number) {
    const [x, y] = PanCake.clientCoordsToWrapperCoords(clientX, clientY, wrapperInnerX, wrapperInnerY);
    return [x / wrapperInnerWidth, y / wrapperInnerHeight] as [number, number];
  }
  relativeWrapperCoordinatesFromClientCoords(clientX: number, clientY: number) {
    return PanCake.relativeWrapperCoordinatesFromClientCoords(clientX, clientY, this.wrapperInnerX, this.wrapperInnerY, this.wrapperInnerWidth, this.wrapperInnerHeight);
  }
  static getCanvasCoords(x: number, y: number, canvasWidth: number, canvasHeight: number, translateX: number, translateY: number, rotate: number, scale: number) {
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
  getCanvasCoords(x: number, y: number) {
    return PanCake.getCanvasCoords(x, y, this.width, this.height, this.translateX, this.translateY, this.rotate, this.renderingScale);
  }
  static normalizeMatrixCoordinates(clientX: number, clientY: number, wrapperInnerX: number, wrapperInnerY: number, canvasWidth: number, canvasHeight: number, translateX: number, translateY: number, rotate: number, scale: number) {
    const innerWrapperCoords = PanCake.clientCoordsToWrapperCoords(clientX, clientY, wrapperInnerX, wrapperInnerY);
    return PanCake.getCanvasCoords(innerWrapperCoords[0], innerWrapperCoords[1], canvasWidth, canvasHeight, translateX, translateY, rotate, scale);
  }
  normalizeMatrixCoordinates(clientX: number, clientY: number) {
    const innerWrapperCoords = this.clientCoordsToWrapperCoords(clientX, clientY);
    return this.getCanvasCoords(innerWrapperCoords[0], innerWrapperCoords[1]);
  }
  static composePoint(x: number, y: number, currScale: number, currTranslate: [number, number], currRotate: number, canvasWidth: number, canvasHeight: number, offset: { left: number; top: number; right: number; bottom: number }, naturalScale: number) {
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
  composePoint(x: number, y: number, currScale?: number, currTranslate?: [number, number], currRotate?: number) {
    return PanCake.composePoint(
      x,
      y,
      currScale ?? this.scale,
      currTranslate ?? [this.translateX, this.translateY],
      currRotate ?? this.rotate,
      this.width,
      this.height,
      { left: this.offsetLeft, top: this.offsetTop, right: this.offsetRight, bottom: this.offsetBottom },
      this.naturalScale
    );
  }
  static calcProjectionTranslate(
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
  // Helper function that calculates the translation needed to map a point on the canvas to a point on the wrapper
  calcProjectionTranslate(newScale: number, wrapperPosition: [number, number], canvasPosition: [number, number], virtualRotate?: number) {
    return PanCake.calcProjectionTranslate(newScale, wrapperPosition, canvasPosition, this.width, this.height, this.wrapperInnerWidth, this.wrapperInnerHeight, this.naturalScale, virtualRotate ?? this.rotate);
  }

  getCenterOffset(scale: number, translate: [number, number], rotate: number) {
    const centeredTranslationOffset = this.calcProjectionTranslate(scale, [0.5, 0.5], [0.5, 0.5], 0);
    const centeredPointNormal = [this.offsetLeft + centeredTranslationOffset[0] + this.width * (scale * this.naturalScale) * 0.5, this.offsetTop + centeredTranslationOffset[1] + this.height * (scale * this.naturalScale) * 0.5];
    const composedPoint = this.composePoint(0.5, 0.5, scale, translate, rotate);

    const diffX = composedPoint[0] - centeredPointNormal[0];
    const diffY = composedPoint[1] - centeredPointNormal[1];

    return [diffX, diffY];
  }

  rotateCanvas(x: number, y: number, radians: number) {
    const newRotate = radians;
    const offset = this.getCenterOffset(this.scale, [0, 0], newRotate);
    const centeredTranslate = [0 - offset[0], 0 - offset[1]] as [number, number];
    const centeredScale = this.scale;
    const centeredRotate = newRotate;
    const virtualPoint = this.composePoint(x, y, centeredScale, centeredTranslate, centeredRotate);
    const currPoint = this.composePoint(x, y);
    const deltaX = currPoint[0] - virtualPoint[0];
    const deltaY = currPoint[1] - virtualPoint[1];
    this.translateX = centeredTranslate[0] + deltaX;
    this.translateY = centeredTranslate[1] + deltaY;
    this.rotate = newRotate;
  }

  constructor() {
    super();
    setTimeout(() => {
      this.scale = 0.5;
    }, 5000);
  }
  handleWheel(deltaX: number, deltaY: number, ctrlKey: boolean, clientX: number, clientY: number) {
    const currScale = this.scale;
    if (ctrlKey) {
      const scaleDelta = (-deltaY / 100) * currScale;
      const newScale = clamp(currScale + scaleDelta, this.minScale, this.maxScale);

      const [translateX, translateY] = this.calcProjectionTranslate(newScale, this.relativeWrapperCoordinatesFromClientCoords(clientX, clientY), this.normalizeMatrixCoordinates(clientX, clientY));

      this.translateX = translateX;
      this.translateY = translateY;
      this.scale = newScale;
    } else {
      this.translateX = this.translateX - deltaX;
      this.translateY = this.translateY - deltaY;
    }
  }
  private gestureStartRotation = 0;
  handleGesturestart() {
    this.gestureStartRotation = this.rotate;
  }
  handleGesturechange(rotation: number, clientX: number, clientY: number) {
    if (this.allowRotation === false) {
      return;
    }
    const currRotation = rotation;
    if (currRotation === 0) {
      return;
    }

    const relPos = this.normalizeMatrixCoordinates(clientX, clientY);
    this.rotateCanvas(relPos[0], relPos[1], this.gestureStartRotation + degreeToRadians(currRotation));
  }
  handleGestureend() {
    // void
  }
  private touchStarts:
    | {
        client: [number, number];
        canvasRel: [number, number];
      }[]
    | null = null;
  private touchStartScale = 1;
  private touchStartTranslate = [0, 0] as [number, number];
  private touchStartRotate = 0;
  private freezeTouches(touches: TouchList) {
    return Array.from(touches).map((touch) => {
      const wrapperCoords = this.clientCoordsToWrapperCoords(touch.clientX, touch.clientY);
      return {
        client: [touch.clientX, touch.clientY] as [number, number],
        canvasRel: this.getCanvasCoords(wrapperCoords[0], wrapperCoords[1]),
      };
    });
  }
  handleTouchstart(event: TouchEvent) {
    event.preventDefault();
    this.touchStarts = this.freezeTouches(event.touches);
    this.touchStartScale = this.scale;
    this.touchStartTranslate = [this.translateX, this.translateY];
    this.touchStartRotate = this.rotate;
  }
  handleTouchmove(event: TouchEvent) {
    event.preventDefault();
    if (this.touchStarts) {
      // Make the touch positions become relative to the inner wrapper
      const touchPositions = Array.from(event.touches).map((touch) => this.clientCoordsToWrapperCoords(touch.clientX, touch.clientY));

      if (touchPositions.length >= 2) {
        // Multi finger touch implementation
        // We're calculating:
        // 1. The scale projection and scale relied delta
        // 2. The rotation projection and rotation delta

        // SCALE

        // Calculate the distance between the two fingers at the start
        const fingerOneStartCanvasCoords = [this.touchStarts[0].canvasRel[0] * this.width, this.touchStarts[0].canvasRel[1] * this.height] as [number, number];
        const fingerTwoStartCanvasCoords = [this.touchStarts[1].canvasRel[0] * this.width, this.touchStarts[1].canvasRel[1] * this.height] as [number, number];

        // This is the absolute distance between the two fingers at the start
        const fingerStartCanvasCoordsDelta = Math.sqrt(Math.pow(fingerOneStartCanvasCoords[0] - fingerTwoStartCanvasCoords[0], 2) + Math.pow(fingerOneStartCanvasCoords[1] - fingerTwoStartCanvasCoords[1], 2));

        // This is the absolute distance between the two fingers now
        const fingersNowDelta = Math.sqrt(Math.pow(touchPositions[0][0] - touchPositions[1][0], 2) + Math.pow(touchPositions[0][1] - touchPositions[1][1], 2)) / this.naturalScale;

        // This is the future scale
        const futureScale = clamp(fingersNowDelta / fingerStartCanvasCoordsDelta, this.minScale, this.maxScale);
        // Justcalculate the relative coordinates of the inner wrapper and the canvas
        const innerWrapperRelPos = [touchPositions[0][0] / this.wrapperInnerWidth, touchPositions[0][1] / this.wrapperInnerHeight] as [number, number];
        const innerCanvasRel = this.touchStarts[0].canvasRel;

        // Project the scale
        const [scaleDeltaX, scaleDeltaY] = this.calcProjectionTranslate(futureScale, innerWrapperRelPos, innerCanvasRel, 0);

        let rotationDeltaX = 0;
        let rotationDeltaY = 0;
        let deltaAngle = 0;

        // ROTATION

        if (this.allowRotation) {
          // Angle between the two fingers at the start
          const startAngle = getAngleBetweenTwoPoints(fingerOneStartCanvasCoords, fingerTwoStartCanvasCoords);
          // Angle between the first finger at the start and the second finger at the current position
          // we're doing this because we're projecting always from the first finger, so it's the anchor point
          const newAngle = getAngleBetweenTwoPoints(touchPositions[0] as [number, number], touchPositions[1] as [number, number]);
          // Delta angle between the original angle the one that we're projecting
          deltaAngle = newAngle - startAngle;

          // This method will project a point on the canvas using the already known scale and its delta
          const projectPosScaled = (x: number, y: number) => {
            return [this.offsetLeft + this.width * x * this.naturalScale * futureScale + scaleDeltaX, this.offsetTop + this.height * y * this.naturalScale * futureScale + scaleDeltaY] as [number, number];
          };

          // Normal 0,0 position
          const originPointProjectionWithoutRotation = projectPosScaled(0, 0);
          // Anchor point
          const anchorPointProjectionWithoutRotation = projectPosScaled(this.touchStarts[0].canvasRel[0], this.touchStarts[0].canvasRel[1]);
          // Origin point with rotation
          const originPointProjectionWithRotation = rotatePoint(originPointProjectionWithoutRotation, anchorPointProjectionWithoutRotation, deltaAngle);

          // Calculate the difference between the original and the rotated point
          rotationDeltaX = originPointProjectionWithRotation[0] - originPointProjectionWithoutRotation[0];
          rotationDeltaY = originPointProjectionWithRotation[1] - originPointProjectionWithoutRotation[1];
        }

        // Set the new values
        this.scale = futureScale;
        this.rotate = deltaAngle;
        this.translateX = scaleDeltaX + rotationDeltaX;
        this.translateY = scaleDeltaY + rotationDeltaY;
      } else {
        // Single finger touch implementation
        const deltaX = event.touches[0].clientX - this.touchStarts[0].client[0];
        const deltaY = event.touches[0].clientY - this.touchStarts[0].client[1];

        const futureTranslate = [this.touchStartTranslate[0] + deltaX, this.touchStartTranslate[1] + deltaY];
        // Set the new values
        this.translateX = futureTranslate[0];
        this.translateY = futureTranslate[1];
      }
    }
  }
  handleTouchend(event: TouchEvent) {
    event.preventDefault();

    if (event.touches.length === 0) {
      this.touchStarts = null;
    } else {
      this.touchStarts = this.freezeTouches(event.touches);
      this.touchStartScale = this.scale;
      this.touchStartTranslate = [this.translateX, this.translateX];
      this.touchStartRotate = this.rotate;
    }
  }
  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('wheel', (event) => {
      this.handleWheel(event.deltaX, event.deltaY, event.ctrlKey, event.clientX, event.clientY);
      event.preventDefault();
      event.stopPropagation();
    });

    // this.addEventListener('gesturestart', (event) => {
    //   this.handleGesturestart();
    // });
    // window.addEventListener('gesturechange', (event) => {
    //   this.handleGesturechange((event as any).rotation, (event as any).clientX, (event as any).clientY);
    // });
    // window.addEventListener('gestureend', (event) => {
    //   this.handleGestureend();
    // });

    this.addEventListener('touchstart', (event) => {
      this.handleTouchstart(event);
    });
    window.addEventListener('touchmove', (event) => {
      this.handleTouchmove(event);
    });
    window.addEventListener('touchend', (event) => {
      this.handleTouchend(event);
    });
  }
  requestUpdate() {
    super.requestUpdate();
    //console.log('update');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pan-cake': PanCake;
  }
}
