import { WheelGestures } from '../..'
import { createWheelEvent } from '../helper/generateEvents'
import { subscribeAndFeedWheelEvents } from '../helper/recordPhases'

describe('updateOptions', () => {
  it('should be able to switch option (preventWheelAction)', function() {
    const { feedEvents, wheelGestures } = subscribeAndFeedWheelEvents()
    const preventDefault = jest.fn()

    function feedDeltaYEvent() {
      feedEvents([
        createWheelEvent({
          deltaY: 5,
          timeStamp: Date.now(),
          preventDefault,
        }),
      ])
    }

    wheelGestures.updateOptions({ preventWheelAction: 'x' })
    feedDeltaYEvent()
    expect(preventDefault).toHaveBeenCalledTimes(0)

    wheelGestures.updateOptions({ preventWheelAction: 'y' })
    feedDeltaYEvent()
    expect(preventDefault).toHaveBeenCalledTimes(1)

    wheelGestures.updateOptions({})
    feedDeltaYEvent()
    expect(preventDefault).toHaveBeenCalledTimes(2)

    wheelGestures.updateOptions({ preventWheelAction: 'x' })
    feedDeltaYEvent()
    expect(preventDefault).toHaveBeenCalledTimes(2)
  })

  it('should return default config by creating & calling updateOptions empty', () => {
    expect(WheelGestures().updateOptions()).toMatchInlineSnapshot(`
      {
        "preventWheelAction": true,
        "reverseSign": [
          true,
          true,
          false,
        ],
      }
    `)
  })

  it('should return config with changed options by calling updateOptions empty', () => {
    expect(WheelGestures({ preventWheelAction: 'x', reverseSign: true }).updateOptions()).toMatchInlineSnapshot(`
      {
        "preventWheelAction": "x",
        "reverseSign": true,
      }
    `)
  })

  it('should preserve unchanged options in config', () => {
    const wheelGestures = WheelGestures({ preventWheelAction: 'x' })
    let changedOptions = wheelGestures.updateOptions({ reverseSign: false })

    expect(changedOptions.preventWheelAction).toBe('x')
    expect(changedOptions.reverseSign).toBe(false)

    changedOptions = wheelGestures.updateOptions({ preventWheelAction: 'y' })

    expect(changedOptions.preventWheelAction).toBe('y')
    expect(changedOptions.reverseSign).toBe(false)
  })

  it('should warn about undefined/null values', function() {
    const logWarn = jest.spyOn(console, 'error').mockImplementation(() => {})
    const wheelGestures = WheelGestures({ preventWheelAction: undefined })
    expect(logWarn).toHaveBeenCalledTimes(1)
    // @ts-expect-error type error expected
    wheelGestures.updateOptions({ reverseSign: null })
    expect(logWarn).toHaveBeenCalledTimes(2)
    expect(logWarn).toHaveBeenCalledWith('updateOptions ignored! undefined & null options not allowed')
  })
})
