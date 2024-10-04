/**
 * public types
 * these types are exported by the module
 */
export type VectorXYZ = [number, number, number]
export type BooleanXYZ = [boolean, boolean, boolean]
export type PreventWheelActionType = boolean | 'x' | 'y' | 'z'
export type ReverseSign = boolean | BooleanXYZ

export interface WheelGesturesConfig {
  preventWheelAction: PreventWheelActionType
  reverseSign: ReverseSign
}

// all options are optional and have reasonable defaults
export type WheelGesturesOptions = Partial<WheelGesturesConfig>
export type WheelEventDataRequiredFields = 'deltaMode' | 'deltaX' | 'deltaY' | 'timeStamp'

export interface WheelEventData
  extends Pick<WheelEvent, WheelEventDataRequiredFields>,
    Partial<Omit<WheelEvent, WheelEventDataRequiredFields>> {}

export interface WheelEventState {
  isStart: boolean
  isMomentum: boolean
  isEnding: boolean
  isMomentumCancel: boolean
  axisDelta: VectorXYZ
  axisVelocity: VectorXYZ
  axisMovement: VectorXYZ
  axisMovementProjection: VectorXYZ
  event: WheelEvent | WheelEventData
  previous?: WheelEventState
}

export type WheelGesturesEventMap = {
  wheel: WheelEventState
}
