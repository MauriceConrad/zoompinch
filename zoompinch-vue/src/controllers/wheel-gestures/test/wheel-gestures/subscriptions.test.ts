import { WheelGestures } from '../..'
import { createWheelEvent } from '../helper/generateEvents'

describe('creation', () => {
  it('can be created without options and return expected general interface', () => {
    expect(WheelGestures()).toMatchInlineSnapshot(`
      {
        "disconnect": [Function],
        "feedWheel": [Function],
        "observe": [Function],
        "off": [Function],
        "on": [Function],
        "unobserve": [Function],
        "updateOptions": [Function],
      }
    `)
  })
})

describe('subscription', () => {
  it('can subscribe', () => {
    const wG = WheelGestures()
    const callback = jest.fn()
    expect(wG.on('wheel', callback)).toBeTruthy()
    wG.feedWheel(createWheelEvent())
    wG.feedWheel(createWheelEvent())
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('can unsubscribe', () => {
    const wG = WheelGestures()
    const callback = jest.fn()
    const callback2 = jest.fn()

    wG.on('wheel', callback)
    wG.off('wheel', callback)

    const unsubscribeCallback2 = wG.on('wheel', callback2)
    unsubscribeCallback2()

    wG.feedWheel(createWheelEvent())

    expect(callback).toHaveBeenCalledTimes(0)
    expect(callback2).toHaveBeenCalledTimes(0)
  })

  it('should work with new', function() {
    // @ts-expect-error new missing in signature
    const wG = new WheelGestures()
    const callback = jest.fn()
    expect(typeof wG.on(callback)).toEqual('function')
  })
})

describe('bind events', () => {
  it('should observe/unobserve target', () => {
    const wG = WheelGestures()
    const addEventListener = jest.spyOn(document.documentElement, 'addEventListener')
    const removeEventListener = jest.spyOn(document.documentElement, 'removeEventListener')
    const callback = jest.fn()

    wG.on('wheel', callback)
    wG.observe(document.documentElement)

    expect(addEventListener).toHaveBeenLastCalledWith('wheel', expect.any(Function), { passive: false })

    document.documentElement.dispatchEvent(new WheelEvent('wheel', createWheelEvent({ deltaY: 10 })))

    expect(callback).toHaveBeenLastCalledWith({
      axisDelta: [-0, -10, 0],
      axisMovement: [0, -10, 0],
      axisVelocity: [-0, -0.025, 0],
      axisMovementProjection: expect.any(Array),
      event: expect.any(Object),
      isEnding: false,
      isMomentum: false,
      isMomentumCancel: false,
      isStart: true,
      previous: undefined,
    })

    wG.unobserve(document.documentElement)
    expect(removeEventListener).toHaveBeenLastCalledWith('wheel', expect.any(Function))
  })

  it('should observe + disconnect all', () => {
    const wG = WheelGestures()
    const addEventListenerDoc = jest.spyOn(document.documentElement, 'addEventListener')
    const removeEventListenerDoc = jest.spyOn(document.documentElement, 'removeEventListener')
    const addEventListenerBody = jest.spyOn(document.body, 'addEventListener')
    const removeEventListenerBody = jest.spyOn(document.body, 'removeEventListener')

    wG.observe(document.documentElement)
    wG.observe(document.body)

    expect(addEventListenerDoc).toHaveBeenLastCalledWith('wheel', expect.any(Function), { passive: false })
    expect(addEventListenerBody).toHaveBeenLastCalledWith('wheel', expect.any(Function), { passive: false })

    wG.disconnect()

    expect(removeEventListenerDoc).toHaveBeenLastCalledWith('wheel', expect.any(Function))
    expect(removeEventListenerBody).toHaveBeenLastCalledWith('wheel', expect.any(Function))
  })
})
