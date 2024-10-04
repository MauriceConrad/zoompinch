import { WheelGesturesConfig } from '../types'
import { deepFreeze } from '../utils'

export const configDefaults: WheelGesturesConfig = deepFreeze({
  preventWheelAction: true,
  reverseSign: [true, true, false],
})
