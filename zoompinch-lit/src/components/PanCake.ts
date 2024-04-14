import { LitElement, PropertyValueMap, css, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './PanCake.scss';
import { rotatePoint, clamp, degreeToRadians, getAngleBetweenTwoPoints, radiansToDegrees, round } from '../util/helpers';
import { calcProjectionTranslate, clientCoordsToWrapperCoords, composePoint, getCanvasCoords, relativeWrapperCoordinatesFromClientCoords } from '../controllers/projection';

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
  minScale = 0.5;
  @property({ type: Number })
  maxScale = 10;
  @property({ type: Boolean })
  bounds = false;
  @property({ type: Boolean })
  allowRotation = true;

  @property({ type: Number })
  _translateX = 0;
  @property({ type: Number })
  get translateX() {
    return this.sugarTransform().x;
  }
  set translateX(newTranslateX) {
    if (this.translateX === newTranslateX) {
      return;
    }
    const { translateX } = this.normalizeSugaredTransform({ x: newTranslateX, y: this.translateY, scale: this.scale, rotate: this.rotate });
    this._translateX = translateX;

    if (!this.transitionEnabledProtected) {
      this.transitionEnabled = false;
    }
  }
  @property({ type: Number })
  _translateY = 0;
  @property({ type: Number })
  get translateY() {
    return this.sugarTransform().y;
  }
  set translateY(newTranslateY) {
    if (this.translateY === newTranslateY) {
      return;
    }
    const { translateY } = this.normalizeSugaredTransform({ x: this.translateX, y: newTranslateY, scale: this.scale, rotate: this.rotate });
    this._translateY = translateY;

    if (!this.transitionEnabledProtected) {
      this.transitionEnabled = false;
    }
  }
  @property({ type: Number })
  _scale = 1;
  @property({ type: Number })
  get scale() {
    return this.sugarTransform().scale;
  }
  set scale(newScale) {
    if (this.scale === newScale) {
      return;
    }
    const newTransform = { x: this.translateX, y: this.translateY, scale: newScale, rotate: this.rotate };
    const { scale, translateX, translateY } = this.normalizeSugaredTransform(newTransform);
    this._scale = scale;
    this._translateX = translateX;
    this._translateY = translateY;

    if (!this.transitionEnabledProtected) {
      this.transitionEnabled = false;
    }
  }
  @property({ type: Number })
  _rotate = 0;
  @property({ type: Number })
  get rotate() {
    return this.sugarTransform().rotate;
  }
  set rotate(newRotate) {
    if (this.rotate === newRotate) {
      return;
    }
    const { rotate, translateX, translateY } = this.normalizeSugaredTransform({ x: this.translateX, y: this.translateY, scale: this.scale, rotate: newRotate });
    this._translateX = translateX;
    this._translateY = translateY;
    this._rotate = rotate;

    if (!this.transitionEnabledProtected) {
      this.transitionEnabled = false;
    }
  }

  requestUpdate(updatedProp: string) {
    super.requestUpdate();
    if (updatedProp === '_translateX') {
      if (this.translateX) {
        this.setAttribute('translateX', this.translateX.toString());
      }
    }
    if (updatedProp === '_translateY') {
      if (this.translateY) {
        this.setAttribute('translateY', this.translateY.toString());
      }
    }
    if (updatedProp === '_scale') {
      if (this.scale) {
        this.setAttribute('scale', this.scale.toString());
      }
    }
    if (updatedProp === '_rotate') {
      if (this.rotate) {
        this.setAttribute('rotate', this.rotate.toString());
      }
    }
  }

  normalizeSugaredTransform(newTransform: { x: number; y: number; scale: number; rotate: number }) {
    const radians = degreeToRadians(newTransform.rotate);
    const offset = this.getCenterOffset(newTransform.scale, [0, 0], radians);
    return {
      translateX: newTransform.x - offset[0],
      translateY: newTransform.y - offset[1],
      scale: newTransform.scale,
      rotate: radians,
    };
  }
  sugarTransform() {
    const offset = this.getCenterOffset(this._scale, [0, 0], this._rotate);
    return {
      x: round(this._translateX + offset[0], 6),
      y: round(this._translateY + offset[1], 6),
      scale: round(this._scale, 6),
      rotate: round(radiansToDegrees(this._rotate), 6),
    };
  }
  private transitionDuration = 0.3;
  private transitionEnabled = false;
  private transitionEnabledProtected = false;
  public applyTransform(newScale: number, wrapperInnerCoords: [number, number], canvasAnchorCoords: [number, number], animate = false) {
    const [translateX, translateY] = this.calcProjectionTranslate(newScale, wrapperInnerCoords, canvasAnchorCoords, 0);
    this._scale = newScale;
    this._translateX = translateX;
    this._translateY = translateY;
    this.transitionEnabled = animate;
    this.transitionEnabledProtected = true;
    // Wait for the next tick to disable the transition protection
    window.requestAnimationFrame(() => {
      this.transitionEnabledProtected = false;
    });
    setTimeout(() => {
      this.transitionEnabled = false;
    }, this.transitionDuration * 1000);
  }

  // attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
  //   // super
  //   super.attributeChangedCallback(name, _old, value);
  // }

  render() {
    return html`
      <div
        class="pan-cake"
        style="--canvas-width: ${this.width}px; --canvas-height: ${this.height}px; --scale: ${this.renderingScale}; --translate-x: ${this.renderingTranslateX}px; --translate-y: ${this.renderingTranslateY}px; --rotate: ${radiansToDegrees(
          this.renderingRotate
        )}deg; --transition-duration: ${this.transitionDuration}s; transition: ${this.transitionEnabled ? `transform var(--transition-duration)` : 'none'};"
      >
        <div class="canvas">
          <slot name="canvas"></slot>
        </div>
        <div class="matrix">
          <slot name="matrix" .foo=${42 * 2}></slot>
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
    return this._scale * this.naturalScale;
  }
  private get renderingTranslateX() {
    return this.offsetLeft + this._translateX;
  }
  private get renderingTranslateY() {
    return this.offsetTop + this._translateY;
  }
  private get renderingRotate() {
    return this._rotate;
  }
  clientCoordsToWrapperCoords(clientX: number, clientY: number) {
    return clientCoordsToWrapperCoords(clientX, clientY, this.wrapperInnerX, this.wrapperInnerY);
  }
  relativeWrapperCoordinatesFromClientCoords(clientX: number, clientY: number) {
    return relativeWrapperCoordinatesFromClientCoords(clientX, clientY, this.wrapperInnerX, this.wrapperInnerY, this.wrapperInnerWidth, this.wrapperInnerHeight);
  }
  getCanvasCoords(x: number, y: number) {
    return getCanvasCoords(x, y, this.width, this.height, this._translateX, this._translateY, this._rotate, this.renderingScale);
  }
  normalizeMatrixCoordinates(clientX: number, clientY: number) {
    const innerWrapperCoords = this.clientCoordsToWrapperCoords(clientX, clientY);
    return this.getCanvasCoords(innerWrapperCoords[0], innerWrapperCoords[1]);
  }
  composePoint(x: number, y: number, currScale?: number, currTranslate?: [number, number], currRotate?: number) {
    return composePoint(
      x,
      y,
      currScale ?? this._scale,
      currTranslate ?? [this._translateX, this._translateY],
      currRotate ?? this._rotate,
      this.width,
      this.height,
      { left: this.offsetLeft, top: this.offsetTop, right: this.offsetRight, bottom: this.offsetBottom },
      this.naturalScale
    );
  }
  // Helper function that calculates the translation needed to map a point on the canvas to a point on the wrapper
  calcProjectionTranslate(newScale: number, wrapperPosition: [number, number], canvasPosition: [number, number], virtualRotate?: number) {
    return calcProjectionTranslate(newScale, wrapperPosition, canvasPosition, this.width, this.height, this.wrapperInnerWidth, this.wrapperInnerHeight, this.naturalScale, virtualRotate ?? this._rotate);
  }

  getCenterOffset(scale: number, translate: [number, number], rotate: number) {
    const centeredTranslationOffset = this.calcProjectionTranslate(scale, [0.5, 0.5], [0.5, 0.5], 0);
    const centeredPointNormal = [this.offsetLeft + centeredTranslationOffset[0] + this.width * (scale * this.naturalScale) * 0.5, this.offsetTop + centeredTranslationOffset[1] + this.height * (scale * this.naturalScale) * 0.5];
    const composedPoint = this.composePoint(0.5, 0.5, scale, translate, rotate);

    const diffX = composedPoint[0] - centeredPointNormal[0];
    const diffY = composedPoint[1] - centeredPointNormal[1];

    return [diffX, diffY];
  }

  public rotateCanvas(x: number, y: number, radians: number) {
    const newRotate = radians;
    const offset = this.getCenterOffset(this._scale, [0, 0], newRotate);
    const centeredTranslate = [0 - offset[0], 0 - offset[1]] as [number, number];
    const centeredScale = this._scale;
    const centeredRotate = newRotate;
    const virtualPoint = this.composePoint(x, y, centeredScale, centeredTranslate, centeredRotate);
    const currPoint = this.composePoint(x, y);
    const deltaX = currPoint[0] - virtualPoint[0];
    const deltaY = currPoint[1] - virtualPoint[1];
    this._translateX = centeredTranslate[0] + deltaX;
    this._translateY = centeredTranslate[1] + deltaY;
    this._rotate = newRotate;
  }

  constructor() {
    super();
    // setTimeout(() => {
    //   this._scale = 0.5;
    // }, 5000);
  }
  handleWheel(event: WheelEvent) {
    const { deltaX, deltaY, ctrlKey, clientX, clientY } = event;
    const currScale = this._scale;
    if (ctrlKey) {
      const scaleDelta = (-deltaY / 100) * currScale;
      const newScale = clamp(currScale + scaleDelta, this.minScale, this.maxScale);

      const [translateX, translateY] = this.calcProjectionTranslate(newScale, this.relativeWrapperCoordinatesFromClientCoords(clientX, clientY), this.normalizeMatrixCoordinates(clientX, clientY));

      this._translateX = translateX;
      this._translateY = translateY;
      this._scale = newScale;
    } else {
      this._translateX = this._translateX - deltaX;
      this._translateY = this._translateY - deltaY;
    }
    event.preventDefault();
    event.stopPropagation();
  }
  private gestureStartRotation = 0;
  handleGesturestart(event: any) {
    this.gestureStartRotation = this._rotate;
  }
  handleGesturechange(event: any) {
    if (this.allowRotation === false) {
      return;
    }
    const currRotation = event.rotation as number;
    if (currRotation === 0) {
      return;
    }

    const relPos = this.normalizeMatrixCoordinates(event.clientX, event.clientY);
    this.rotateCanvas(relPos[0], relPos[1], this.gestureStartRotation + degreeToRadians(currRotation));
  }
  handleGestureend(event: any) {
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
    this.touchStartScale = this._scale;
    this.touchStartTranslate = [this._translateX, this._translateY];
    this.touchStartRotate = this._rotate;
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
        this._scale = futureScale;
        this._rotate = deltaAngle;
        this._translateX = scaleDeltaX + rotationDeltaX;
        this._translateY = scaleDeltaY + rotationDeltaY;
      } else {
        // Single finger touch implementation
        const deltaX = event.touches[0].clientX - this.touchStarts[0].client[0];
        const deltaY = event.touches[0].clientY - this.touchStarts[0].client[1];

        const futureTranslate = [this.touchStartTranslate[0] + deltaX, this.touchStartTranslate[1] + deltaY];
        // Set the new values
        this._translateX = futureTranslate[0];
        this._translateY = futureTranslate[1];
      }
    }
  }
  handleTouchend(event: TouchEvent) {
    //event.preventDefault();

    if (event.touches.length === 0) {
      this.touchStarts = null;
    } else {
      this.touchStarts = this.freezeTouches(event.touches);
      this.touchStartScale = this._scale;
      this.touchStartTranslate = [this._translateX, this._translateX];
      this.touchStartRotate = this._rotate;
    }
  }
  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('wheel', (event) => {
      this.handleWheel(event);
    });

    this.addEventListener('gesturestart', (event) => {
      this.handleGesturestart(event);
    });
    window.addEventListener('gesturechange', (event) => {
      this.handleGesturechange(event);
    });
    window.addEventListener('gestureend', (event) => {
      this.handleGestureend(event);
    });

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
}

declare global {
  interface HTMLElementTagNameMap {
    'pan-cake': PanCake;
  }
}
