import { deepFreeze } from '../utils'

export type EventMapEmpty = Record<string, unknown>
export type EventListener<D = unknown> = (data: D) => void
export type Off = () => void

export default function EventBus<EventMap = EventMapEmpty>() {
  const listeners = {} as Record<keyof EventMap, EventListener<never>[]>

  function on<EK extends keyof EventMap>(type: EK, listener: EventListener<EventMap[EK]>): Off {
    listeners[type] = (listeners[type] || []).concat(listener)
    return () => off(type, listener)
  }

  function off<EK extends keyof EventMap>(type: EK, listener: EventListener<EventMap[EK]>) {
    listeners[type] = (listeners[type] || []).filter((l) => l !== listener)
  }

  function dispatch<EK extends keyof EventMap>(type: EK, data: EventMap[EK]) {
    if (!(type in listeners)) return
    ;(listeners[type] as EventListener<EventMap[EK]>[]).forEach((l) => l(data))
  }

  return deepFreeze({
    on,
    off,
    dispatch,
  })
}
