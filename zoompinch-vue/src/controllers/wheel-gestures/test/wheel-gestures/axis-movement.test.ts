import { lastOf } from '../../utils'
import { generateEvents } from '../helper/generateEvents'
import { subscribeAndFeedWheelEvents } from '../helper/recordPhases'

describe('axisMovement', () => {
  it('positive target', () => {
    const { allPhaseData } = subscribeAndFeedWheelEvents(generateEvents({ deltaTotal: [100, 500], durationMs: 1000 }))
    const axisMovement = lastOf(allPhaseData).axisMovement

    expect(axisMovement[0]).toBeCloseTo(100)
    expect(axisMovement[1]).toBeCloseTo(500)
  })

  it('negative target', () => {
    const { allPhaseData } = subscribeAndFeedWheelEvents(generateEvents({ deltaTotal: [-200, -300], durationMs: 1000 }))
    const axisMovement = lastOf(allPhaseData).axisMovement

    expect(axisMovement[0]).toBeCloseTo(-200)
    expect(axisMovement[1]).toBeCloseTo(-300)
  })

  it('mixed target', () => {
    const { allPhaseData } = subscribeAndFeedWheelEvents(generateEvents({ deltaTotal: [-40, 21], durationMs: 1000 }))
    const axisMovement = lastOf(allPhaseData).axisMovement

    expect(axisMovement[0]).toBeCloseTo(-40)
    expect(axisMovement[1]).toBeCloseTo(21)
  })
})
