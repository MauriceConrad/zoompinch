import EventBus from '../events/EventBus'
import { WheelTargetObserver } from '../events/WheelTargetObserver'
import {
  VectorXYZ,
  WheelEventData,
  WheelEventState,
  WheelGesturesConfig,
  WheelGesturesEventMap,
  WheelGesturesOptions,
} from '../types'
import { absMax, addVectors, average, deepFreeze, lastOf, projection } from '../utils'
import { clampAxisDelta, normalizeWheel, reverseAxisDeltaSign } from '../wheel-normalizer/wheel-normalizer'
import { __DEV__, ACC_FACTOR_MAX, ACC_FACTOR_MIN, WHEELEVENTS_TO_ANALAZE, WHEELEVENTS_TO_MERGE } from './constants'
import { configDefaults } from './options'
import { createWheelGesturesState } from './state'

export function WheelGestures(optionsParam: WheelGesturesOptions = {}) {
  const { on, off, dispatch } = EventBus<WheelGesturesEventMap>()
  let config = configDefaults
  let state = createWheelGesturesState()
  let currentEvent: WheelEventData
  let negativeZeroFingerUpSpecialEvent = false
  let prevWheelEventState: WheelEventState | undefined

  const feedWheel = (wheelEvents: WheelEventData | WheelEventData[]) => {
    if (Array.isArray(wheelEvents)) {
      wheelEvents.forEach((wheelEvent) => processWheelEventData(wheelEvent))
    } else {
      processWheelEventData(wheelEvents)
    }
  }

  const updateOptions = (newOptions: WheelGesturesOptions = {}): WheelGesturesConfig => {
    if (Object.values(newOptions).some((option) => option === undefined || option === null)) {
      __DEV__ && console.error('updateOptions ignored! undefined & null options not allowed')
      return config
    }
    return (config = deepFreeze({ ...configDefaults, ...config, ...newOptions }))
  }

  const publishWheel = (additionalData?: Partial<WheelEventState>) => {
    const wheelEventState: WheelEventState = {
      event: currentEvent,
      isStart: false,
      isEnding: false,
      isMomentumCancel: false,
      isMomentum: state.isMomentum,
      axisDelta: [0, 0, 0],
      axisVelocity: state.axisVelocity,
      axisMovement: state.axisMovement,
      get axisMovementProjection() {
        return addVectors(
          wheelEventState.axisMovement,
          wheelEventState.axisVelocity.map((velocity) => projection(velocity)) as VectorXYZ
        )
      },
      ...additionalData,
    }

    dispatch('wheel', {
      ...wheelEventState,
      previous: prevWheelEventState,
    })

    // keep reference without previous, otherwise we would create a long chain
    prevWheelEventState = wheelEventState
  }

  // should prevent when there is mainly movement on the desired axis
  const shouldPreventDefault = (deltaMaxAbs: number, axisDelta: VectorXYZ): boolean => {
    const { preventWheelAction } = config
    const [deltaX, deltaY, deltaZ] = axisDelta

    if (typeof preventWheelAction === 'boolean') return preventWheelAction

    switch (preventWheelAction) {
      case 'x':
        return Math.abs(deltaX) >= deltaMaxAbs
      case 'y':
        return Math.abs(deltaY) >= deltaMaxAbs
      case 'z':
        return Math.abs(deltaZ) >= deltaMaxAbs
      default:
        __DEV__ && console.warn('unsupported preventWheelAction value: ' + preventWheelAction, 'warn')
        return false
    }
  }

  const processWheelEventData = (wheelEvent: WheelEventData) => {
    const { axisDelta, timeStamp } = clampAxisDelta(
      reverseAxisDeltaSign(normalizeWheel(wheelEvent), config.reverseSign)
    )
    const deltaMaxAbs = absMax(axisDelta)

    if (wheelEvent.preventDefault && shouldPreventDefault(deltaMaxAbs, axisDelta)) {
      wheelEvent.preventDefault()
    }

    if (!state.isStarted) {
      start()
    }
    // check if user started scrolling again -> cancel
    else if (state.isMomentum && deltaMaxAbs > Math.max(2, state.lastAbsDelta * 2)) {
      end(true)
      start()
    }

    // special finger up event on windows + blink
    if (deltaMaxAbs === 0 && Object.is && Object.is(wheelEvent.deltaX, -0)) {
      negativeZeroFingerUpSpecialEvent = true
      // return -> zero delta event should not influence velocity
      return
    }

    currentEvent = wheelEvent
    state.axisMovement = addVectors(state.axisMovement, axisDelta)
    state.lastAbsDelta = deltaMaxAbs
    state.scrollPointsToMerge.push({
      axisDelta,
      timeStamp,
    })

    mergeScrollPointsCalcVelocity()

    // only wheel event (move) and not start/end get the delta values
    publishWheel({ axisDelta, isStart: !state.isStartPublished }) // state.isMomentum ? MOMENTUM_WHEEL : WHEEL, { axisDelta })

    // publish start after velocity etc. have been updated
    state.isStartPublished = true

    // calc debounced end function, to recognize end of wheel event stream
    willEnd()
  }

  const mergeScrollPointsCalcVelocity = () => {
    if (state.scrollPointsToMerge.length === WHEELEVENTS_TO_MERGE) {
      state.scrollPoints.unshift({
        axisDeltaSum: state.scrollPointsToMerge.map((b) => b.axisDelta).reduce(addVectors),
        timeStamp: average(state.scrollPointsToMerge.map((b) => b.timeStamp)),
      })

      // only update velocity after a merged scrollpoint was generated
      updateVelocity()

      // reset toMerge array
      state.scrollPointsToMerge.length = 0

      // after calculation of velocity only keep the most recent merged scrollPoint
      state.scrollPoints.length = 1

      if (!state.isMomentum) {
        detectMomentum()
      }
    } else if (!state.isStartPublished) {
      updateStartVelocity()
    }
  }

  const updateStartVelocity = () => {
    state.axisVelocity = lastOf(state.scrollPointsToMerge).axisDelta.map((d) => d / state.willEndTimeout) as VectorXYZ
  }

  const updateVelocity = () => {
    // need to have two recent points to calc velocity
    const [latestScrollPoint, prevScrollPoint] = state.scrollPoints

    if (!prevScrollPoint || !latestScrollPoint) {
      return
    }

    // time delta
    const deltaTime = latestScrollPoint.timeStamp - prevScrollPoint.timeStamp

    if (deltaTime <= 0) {
      __DEV__ && console.warn('invalid deltaTime')
      return
    }

    // calc the velocity per axes
    const velocity = latestScrollPoint.axisDeltaSum.map((d) => d / deltaTime) as VectorXYZ

    // calc the acceleration factor per axis
    const accelerationFactor = velocity.map((v, i) => v / (state.axisVelocity[i] || 1))

    state.axisVelocity = velocity
    state.accelerationFactors.push(accelerationFactor)

    updateWillEndTimeout(deltaTime)
  }

  const updateWillEndTimeout = (deltaTime: number) => {
    // use current time between events rounded up and increased by a bit as timeout
    let newTimeout = Math.ceil(deltaTime / 10) * 10 * 1.2

    // double the timeout, when momentum was not detected yet
    if (!state.isMomentum) {
      newTimeout = Math.max(100, newTimeout * 2)
    }

    state.willEndTimeout = Math.min(1000, Math.round(newTimeout))
  }

  const accelerationFactorInMomentumRange = (accFactor: number) => {
    // when main axis is the the other one and there is no movement/change on the current one
    if (accFactor === 0) return true
    return accFactor <= ACC_FACTOR_MAX && accFactor >= ACC_FACTOR_MIN
  }

  const detectMomentum = () => {
    if (state.accelerationFactors.length >= WHEELEVENTS_TO_ANALAZE) {
      if (negativeZeroFingerUpSpecialEvent) {
        negativeZeroFingerUpSpecialEvent = false

        if (absMax(state.axisVelocity) >= 0.2) {
          recognizedMomentum()
          return
        }
      }

      const recentAccelerationFactors = state.accelerationFactors.slice(WHEELEVENTS_TO_ANALAZE * -1)

      // check recent acceleration / deceleration factors
      // all recent need to match, if any did not match
      const detectedMomentum = recentAccelerationFactors.every((accFac) => {
        // when both axis decelerate exactly in the same rate it is very likely caused by momentum
        const sameAccFac = !!accFac.reduce((f1, f2) => (f1 && f1 < 1 && f1 === f2 ? 1 : 0))

        // check if acceleration factor is within momentum range
        const bothAreInRangeOrZero = accFac.filter(accelerationFactorInMomentumRange).length === accFac.length

        // one the requirements must be fulfilled
        return sameAccFac || bothAreInRangeOrZero
      })

      if (detectedMomentum) {
        recognizedMomentum()
      }

      // only keep the most recent events
      state.accelerationFactors = recentAccelerationFactors
    }
  }

  const recognizedMomentum = () => {
    state.isMomentum = true
  }

  const start = () => {
    state = createWheelGesturesState()
    state.isStarted = true
    state.startTime = Date.now()
    prevWheelEventState = undefined
    negativeZeroFingerUpSpecialEvent = false
  }

  const willEnd = (() => {
    let willEndId: number
    return () => {
      clearTimeout(willEndId)
      willEndId = setTimeout(end, state.willEndTimeout)
    }
  })()

  const end = (isMomentumCancel = false) => {
    if (!state.isStarted) return

    if (state.isMomentum && isMomentumCancel) {
      publishWheel({ isEnding: true, isMomentumCancel: true })
    } else {
      publishWheel({ isEnding: true })
    }

    state.isMomentum = false
    state.isStarted = false
  }

  const { observe, unobserve, disconnect } = WheelTargetObserver(feedWheel)

  updateOptions(optionsParam)

  return deepFreeze({
    on,
    off,
    observe,
    unobserve,
    disconnect,
    feedWheel,
    updateOptions,
  })
}
