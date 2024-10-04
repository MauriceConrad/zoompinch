import { VectorXYZ } from '../types'
import { normalizeWheel, reverseAxisDeltaSign } from '../wheel-normalizer/wheel-normalizer'

const wheelEvent = { axisDelta: [5, 2, 1] as VectorXYZ }

describe('reverseSign', () => {
  test('all: true', () => {
    expect(reverseAxisDeltaSign(wheelEvent, true)).toEqual({ axisDelta: [-5, -2, -1] })
  })

  test('none: false', () => {
    expect(reverseAxisDeltaSign(wheelEvent, false)).toEqual({ axisDelta: [5, 2, 1] })
  })

  test('custom: array', () => {
    expect(reverseAxisDeltaSign(wheelEvent, [false, false, false])).toEqual({ axisDelta: [5, 2, 1] })
    expect(reverseAxisDeltaSign(wheelEvent, [true, true, true])).toEqual({ axisDelta: [-5, -2, -1] })
    expect(reverseAxisDeltaSign(wheelEvent, [true, true, false])).toEqual({ axisDelta: [-5, -2, 1] })
  })
})

describe('normalizeWheel', () => {
  test('deltaMode: 0', () => {
    expect(normalizeWheel({ deltaX: 2, deltaY: 10, deltaZ: 33, deltaMode: 0, timeStamp: 0 }).axisDelta).toEqual([
      2,
      10,
      33,
    ])
  })

  test('deltaMode: 1', () => {
    expect(normalizeWheel({ deltaX: 2, deltaY: 10, deltaZ: 33, deltaMode: 1, timeStamp: 0 }).axisDelta).toEqual([
      2 * 18,
      10 * 18,
      33 * 18,
    ])
  })

  test('deltaMode: 2', () => {
    expect(normalizeWheel({ deltaX: 2, deltaY: 10, deltaZ: 33, deltaMode: 2, timeStamp: 0 }).axisDelta).toEqual([
      2 * window.innerHeight,
      10 * window.innerHeight,
      33 * window.innerHeight,
    ])
  })
})
