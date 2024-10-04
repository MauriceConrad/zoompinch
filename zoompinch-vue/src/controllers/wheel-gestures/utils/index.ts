export * from './projection'

export function lastOf<T>(array: T[]) {
  return array[array.length - 1]
}

export function average(numbers: number[]) {
  return numbers.reduce((a, b) => a + b) / numbers.length
}

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(min, value), max)

export function addVectors<T extends number[]>(v1: T, v2: T): T {
  if (v1.length !== v2.length) {
    throw new Error('vectors must be same length')
  }
  return v1.map((val, i) => val + v2[i]) as T
}

export function absMax(numbers: number[]) {
  return Math.max(...numbers.map(Math.abs))
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function deepFreeze<T extends object>(o: T): Readonly<T> {
  Object.freeze(o)
  Object.values(o).forEach((value) => {
    if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value)
    }
  })
  return o
}
