import { ReverseSign, VectorXYZ, WheelEventData } from '../types'
import { clamp } from '../utils'

export interface NormalizedWheel {
  axisDelta: VectorXYZ
  timeStamp: number
}

const LINE_HEIGHT = 16 * 1.125
const PAGE_HEIGHT = (typeof window !== 'undefined' && window.innerHeight) || 800
const DELTA_MODE_UNIT = [1, LINE_HEIGHT, PAGE_HEIGHT]

export function normalizeWheel(e: WheelEventData): NormalizedWheel {
  const deltaX = e.deltaX * DELTA_MODE_UNIT[e.deltaMode]
  const deltaY = e.deltaY * DELTA_MODE_UNIT[e.deltaMode]
  const deltaZ = (e.deltaZ || 0) * DELTA_MODE_UNIT[e.deltaMode]

  return {
    timeStamp: e.timeStamp,
    axisDelta: [deltaX, deltaY, deltaZ],
  }
}

const reverseAll = [-1, -1, -1]

export function reverseAxisDeltaSign<T extends Pick<NormalizedWheel, 'axisDelta'>>(
  wheel: T,
  reverseSign: ReverseSign
): T {
  if (!reverseSign) {
    return wheel
  }

  const multipliers = reverseSign === true ? reverseAll : reverseSign.map((shouldReverse) => (shouldReverse ? -1 : 1))

  return {
    ...wheel,
    axisDelta: wheel.axisDelta.map((delta, i) => delta * multipliers[i]),
  }
}

const DELTA_MAX_ABS = 700

export const clampAxisDelta = <T extends Pick<NormalizedWheel, 'axisDelta'>>(wheel: T) => {
  return {
    ...wheel,
    axisDelta: wheel.axisDelta.map((delta) => clamp(delta, -DELTA_MAX_ABS, DELTA_MAX_ABS)),
  }
}
