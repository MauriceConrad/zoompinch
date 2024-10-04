import { WheelEventState } from '../../types'
import { lastOf } from '../../utils'
import { generateEvents } from '../helper/generateEvents'
import { subscribeAndFeedWheelEvents } from '../helper/recordPhases'

function calcAverageVelocity(phases: WheelEventState[]) {
  return phases.reduce(
    (averageAcc, { axisVelocity }) => {
      averageAcc[0] = (averageAcc[0] + axisVelocity[0]) / 2
      averageAcc[1] = (averageAcc[1] + axisVelocity[1]) / 2
      return averageAcc
    },
    [0, 0]
  )
}

describe('velocity', () => {
  it('should have velocity in first (and only) event - x', () => {
    const { allPhaseData } = subscribeAndFeedWheelEvents({
      wheelEvents: [{ deltaX: 0, deltaY: 20, deltaMode: 0, timeStamp: 0 }],
    })
    const [xVelo, yVelo] = allPhaseData[1].axisVelocity

    // velocity in first event is based on the initial timeout between two events
    expect(xVelo).toEqual(0)
    expect(yVelo).toEqual(20 / 400)
    expect(allPhaseData).toMatchSnapshot()
  })

  it('check average velocity', () => {
    const { allPhaseData } = subscribeAndFeedWheelEvents(generateEvents({ deltaTotal: [0, 500], durationMs: 1000 }))
    const averageVelocity = calcAverageVelocity(allPhaseData)

    expect(averageVelocity[0]).toBeCloseTo(0)
    expect(averageVelocity[1]).toBeCloseTo(0.5)
  })

  it('check average velocity - different total delta', () => {
    const { allPhaseData } = subscribeAndFeedWheelEvents(generateEvents({ deltaTotal: [0, 1000], durationMs: 1000 }))
    const averageVelocity = calcAverageVelocity(allPhaseData)

    expect(averageVelocity[0]).toBeCloseTo(0)
    expect(averageVelocity[1]).toBeCloseTo(1)
  })

  it('velocity & axisDeltas - different event rate', () => {
    const { allPhaseData } = subscribeAndFeedWheelEvents(
      generateEvents({ deltaTotal: [0, 1000], durationMs: 1000, eventEveryMs: 1000 / 30 })
    )
    const averageVelocity = calcAverageVelocity(allPhaseData)

    expect(averageVelocity[0]).toBeCloseTo(0)
    expect(averageVelocity[1]).toBeCloseTo(1)

    const [deltaX, deltaY] = lastOf(allPhaseData).axisMovement

    expect(deltaX).toBeCloseTo(0)
    expect(deltaY).toBeCloseTo(1000)
  })

  it('velocity & axisDeltas - x & y axis', () => {
    const { allPhaseData } = subscribeAndFeedWheelEvents(
      generateEvents({ deltaTotal: [2000, 2000], durationMs: 1000, eventEveryMs: 1000 / 30 })
    )
    const averageVelocity = calcAverageVelocity(allPhaseData)

    expect(averageVelocity[0]).toBeCloseTo(2)
    expect(averageVelocity[1]).toBeCloseTo(2)

    const [deltaX, deltaY] = lastOf(allPhaseData).axisMovement

    expect(deltaX).toBeCloseTo(2000)
    expect(deltaY).toBeCloseTo(2000)
  })
})
