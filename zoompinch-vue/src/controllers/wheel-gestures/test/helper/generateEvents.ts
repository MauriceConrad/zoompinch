import { WheelEventData } from '../../types'

interface GenerateEventsProps {
  deltaTotal: number[]
  durationMs: number
  eventEveryMs?: number
  deltaMode?: number
}

export function createWheelEvent({
  deltaX = 0,
  deltaY = 0,
  deltaZ = 0,
  deltaMode = 0,
  timeStamp = 0,
  ...rest
}: Partial<WheelEventData> = {}): WheelEventData {
  return {
    deltaX,
    deltaY,
    deltaZ,
    deltaMode,
    timeStamp,
    ...rest,
  }
}

export function generateEvents({
  deltaTotal,
  durationMs,
  eventEveryMs = 1000 / 60,
  deltaMode = 0,
}: GenerateEventsProps) {
  const wheelEvents: WheelEventData[] = []
  const [deltaX, deltaY, deltaZ] = deltaTotal.map((d) => (d / durationMs) * eventEveryMs)

  let timeStamp = 0
  while (timeStamp < durationMs && Math.round(timeStamp + eventEveryMs) <= durationMs) {
    timeStamp += eventEveryMs

    wheelEvents.push({
      deltaX,
      deltaY,
      deltaZ,
      deltaMode,
      timeStamp,
    })
  }

  return { wheelEvents }
}
