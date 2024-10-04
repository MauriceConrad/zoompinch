/**
 * the timeout is automatically adjusted during a gesture
 * the initial timeout period is pretty long, so even old mouses, which emit wheel events less often, can produce a continuous gesture
 */
import { WheelGesturesInternalState } from './internal-types'

const WILL_END_TIMEOUT_DEFAULT = 400

export function createWheelGesturesState(): WheelGesturesInternalState {
  return {
    isStarted: false,
    isStartPublished: false,
    isMomentum: false,
    startTime: 0,
    lastAbsDelta: Infinity,
    axisMovement: [0, 0, 0],
    axisVelocity: [0, 0, 0],
    accelerationFactors: [],
    scrollPoints: [],
    scrollPointsToMerge: [],
    willEndTimeout: WILL_END_TIMEOUT_DEFAULT,
  }
}
