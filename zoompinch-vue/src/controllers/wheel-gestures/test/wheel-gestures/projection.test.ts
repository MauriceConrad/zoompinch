import { WheelEventData } from '../../types'
import { lastOf } from '../../utils'
import swipeLeftTrackpad from '../fixtures/swipe-left-trackpad.json'
import swipeRight from '../fixtures/swipe-right.json'
import swipeUpTrackpad from '../fixtures/swipe-up-trackpad.json'
import { subscribeAndFeedWheelEvents } from '../helper/recordPhases'

function checkProjection(wheelEvents: WheelEventData[]) {
  const { allPhaseData } = subscribeAndFeedWheelEvents({ wheelEvents })

  const firstMomentumStateWithMomentum = allPhaseData.find((data) => data.isMomentum)
  if (!firstMomentumStateWithMomentum) throw new Error('missing firstMomentumStateWithMomentum')

  const lastState = lastOf(allPhaseData)

  expect(lastState.isEnding).toBeTruthy()
  expect(lastState.isMomentum).toBeTruthy()

  firstMomentumStateWithMomentum.axisMovementProjection.forEach((axisProjection, axisIndex) => {
    const diff = Math.abs(axisProjection - lastState.axisMovement[axisIndex])
    expect(diff).toBeLessThanOrEqual(230)
  })
}

describe('projection', () => {
  it('should project axis movement pretty accurate when detecting isMomentum', () => {
    checkProjection(swipeRight.wheelEvents)
    checkProjection(swipeUpTrackpad.wheelEvents)
    checkProjection(swipeLeftTrackpad.wheelEvents)
  })
})
