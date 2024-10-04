import winRightFast from '../fixtures/negative-zero-event/win-chrome-fast-right-ptp.json'
import winRight from '../fixtures/negative-zero-event/win-chrome-right-ptp.json'
import { recordPhases } from '../helper/recordPhases'

describe('negative zero event', () => {
  test('Win - Chrome - swipe right', () => {
    expect(winRight.wheelEvents.filter((eventData) => Object.is(-0, eventData.deltaX)).length).toBe(1)
    expect(recordPhases(winRight.wheelEvents)).toMatchSnapshot()
  })

  test('Win - Chrome - swipe right fast', () => {
    expect(winRightFast.wheelEvents.filter((eventData) => Object.is(-0, eventData.deltaX)).length).toBe(1)
    expect(recordPhases(winRightFast.wheelEvents)).toMatchSnapshot()
  })
})
