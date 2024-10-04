import { VectorXYZ } from '../types'

export interface WheelGesturesInternalState {
  isStarted: boolean
  isStartPublished: boolean
  isMomentum: boolean
  startTime: number
  lastAbsDelta: number
  axisMovement: VectorXYZ
  axisVelocity: VectorXYZ
  accelerationFactors: number[][]
  scrollPoints: MergedScrollPoint[]
  scrollPointsToMerge: ScrollPoint[]
  willEndTimeout: number
}

export interface ScrollPoint {
  axisDelta: VectorXYZ
  timeStamp: number
}

export interface MergedScrollPoint {
  axisDeltaSum: VectorXYZ
  timeStamp: number
}
