import * as WheelGestureExports from '../../index'

test('exports', () => {
  expect(WheelGestureExports.default.name).toEqual('WheelGestures')

  // freeze in snapshot to check export changes/regressions
  expect(WheelGestureExports).toMatchInlineSnapshot(`
    {
      "WheelGestures": [Function],
      "absMax": [Function],
      "addVectors": [Function],
      "average": [Function],
      "clamp": [Function],
      "configDefaults": {
        "preventWheelAction": true,
        "reverseSign": [
          true,
          true,
          false,
        ],
      },
      "deepFreeze": [Function],
      "default": [Function],
      "lastOf": [Function],
      "projection": [Function],
    }
  `)
})
