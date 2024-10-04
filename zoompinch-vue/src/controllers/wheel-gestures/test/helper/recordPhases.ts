import { WheelEventData, WheelEventState } from '../../types'
import { WheelGestures } from '../../wheel-gestures/wheel-gestures'

interface SubAndFeedProps {
  beforeFeed?: (e: WheelEventData, i: number) => void
  callback?: (data: WheelEventState) => void
  wheelEvents?: WheelEventData[]
}

export function subscribeAndFeedWheelEvents({ beforeFeed, callback, wheelEvents = [] }: SubAndFeedProps = {}) {
  const allPhaseData: WheelEventState[] = []

  // need to use fake timers, so we can run the debounced end function after feeding all events
  jest.useFakeTimers()

  const wheelGestures = WheelGestures({ reverseSign: false })

  callback && wheelGestures.on('wheel', callback)
  wheelGestures.on('wheel', (data) => allPhaseData.push(data))

  let prevTimeStamp = 0

  function feedEvents(eventsToFeed: WheelEventData[]) {
    eventsToFeed.forEach((e, i) => {
      // move time forward (triggers eg. timeouts with end continues gesture)
      if (prevTimeStamp) {
        jest.advanceTimersByTime(e.timeStamp - prevTimeStamp)
      }

      beforeFeed && beforeFeed(e, i)
      wheelGestures.feedWheel(e)

      prevTimeStamp = e.timeStamp
    })

    // fast forward and exhaust currently pending timers, this will trigger the *_END events
    jest.runOnlyPendingTimers()
  }

  feedEvents(wheelEvents)

  return { wheelGestures, allPhaseData, feedEvents }
}

export type Range = [number, number]
export type RangeWheelType = 'user' | 'momentum'

export interface PhaseRange extends Omit<WheelEventState, 'previous' | 'axisMovementProjection'> {
  wheelType: RangeWheelType
  range: Range
  hasPrevious: boolean
}

export function recordPhases(wheelEvents: WheelEventData[]) {
  const phases: PhaseRange[] = []
  const phaseRange: Record<RangeWheelType, Range> = {
    user: [-1, -1],
    momentum: [-1, -1],
  }
  let eventIndex = -1

  // record phases
  subscribeAndFeedWheelEvents({
    // update index which is used to keep track of the ranges
    beforeFeed: (_, i) => (eventIndex = i),
    callback: (data) => {
      const { isStart, isMomentum, isEnding, isMomentumCancel, previous, axisMovementProjection, ...restData } = data
      const wheelType: RangeWheelType = isMomentum ? 'momentum' : 'user'

      if (isEnding || isMomentumCancel) {
        phaseRange[wheelType][1] = eventIndex

        // check if phase has a valid start index, if save the phase
        if (phaseRange[wheelType][0] >= 0) {
          phases.push({
            wheelType,
            range: phaseRange[wheelType],
            isStart,
            isMomentum,
            isEnding,
            isMomentumCancel,
            hasPrevious: !!previous,
            ...restData,
          })
        }

        // end & reset phase
        phaseRange[wheelType] = [-1, -1]
      }
      // keep track of start and end indices for each phase
      else if (isStart || isMomentum) {
        phaseRange[wheelType][0] = eventIndex
      }
    },
    wheelEvents,
  })

  return { phases }
}
