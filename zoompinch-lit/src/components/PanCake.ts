import { LitElement, PropertyValueMap, css, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './PanCake.scss';
import { rotatePoint } from '../util/vector';

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
  static calcProjectionTranslate(newScale: number, wrapperPosition: [number, number], canvasPosition: [number, number], canvasWidth: number, canvasHeight: number, wrapperInnerWidth: number, wrapperInnerHeight: number, naturalScale: number) {
    // Calculate the intrinsic dimensions of the canvas
    const canvasIntrinsicWidth = canvasWidth * naturalScale;
    const canvasIntrinsicHeight = canvasHeight * naturalScale;
    // Calculate the real dimensions of the canvas
    const canvasRealX = canvasPosition[0] * canvasIntrinsicWidth * newScale;
    const canvasRealY = canvasPosition[1] * canvasIntrinsicHeight * newScale;
    // Calculate the real dimensions of the wrapper
    const wrapperRealX = wrapperPosition[0] * wrapperInnerWidth;
    const wrapperRealY = wrapperPosition[1] * wrapperInnerHeight;
    // Calculate the delta between the canvas and the wrapper
    const deltaX = wrapperRealX - canvasRealX;
    const deltaY = wrapperRealY - canvasRealY;

    return [deltaX, deltaY] as [number, number];
  }
  // Helper function that calculates the translation needed to map a point on the canvas to a point on the wrapper
  calcProjectionTranslate(newScale: number, wrapperPosition: [number, number], canvasPosition: [number, number]) {
    return PanCake.calcProjectionTranslate(newScale, wrapperPosition, canvasPosition, this.width, this.height, this.wrapperInnerWidth, this.wrapperInnerHeight, this.naturalScale);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pan-cake': PanCake;
  }
}
