import { createWheelEvent } from '../helper/generateEvents'
import { subscribeAndFeedWheelEvents } from '../helper/recordPhases'

describe('axisDelta', () => {
  it('all but end wheel events should have delta (is detected async)', () => {
    const wheelEvent = createWheelEvent({ deltaX: 5, deltaY: 2, deltaZ: 1 })
    const { allPhaseData } = subscribeAndFeedWheelEvents({ wheelEvents: [wheelEvent, wheelEvent, wheelEvent] })

    // check move types
    allPhaseData.filter((data) => !data.isEnding).every((data) => expect(data.axisDelta).toEqual([5, 2, 1]))

    // check non-move types (start & end events)
    allPhaseData.filter((data) => data.isEnding).every((data) => expect(data.axisDelta).toEqual([0, 0, 0]))
  })
})
