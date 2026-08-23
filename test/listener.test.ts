import { describe, expect, mock, test } from 'bun:test'
import { listenAll, type MsgHandler } from '../src/listener/index.ts'
import { readMock } from './helpers.ts'

type Listener = (data?: any) => void

class FakeLive {
  readonly listeners = new Map<string, Listener[]>()

  on(eventName: string, listener: Listener) {
    const listeners = this.listeners.get(eventName) ?? []
    listeners.push(listener)
    this.listeners.set(eventName, listeners)
    return this
  }

  emit(eventName: string, data?: any) {
    for (const listener of this.listeners.get(eventName) ?? []) {
      listener(data)
    }
  }
}

const attach = (handler: MsgHandler) => {
  const live = new FakeLive()
  listenAll(live as never, 77_777_777_774, handler)
  return live
}

describe('listener dispatch', () => {
  test('delivers raw and parsed bodies from one upstream subscription', async () => {
    const raw = await readMock<any>('DANMU_MSG/emoticon_normal.json')
    const onRaw = mock((_body: any) => undefined)
    const onIncomeDanmu = mock((_message: any) => undefined)
    const live = attach({ onIncomeDanmu, raw: { DANMU_MSG: onRaw } })

    live.emit('DANMU_MSG', { data: raw })

    expect(live.listeners.get('DANMU_MSG')).toHaveLength(1)
    expect(onRaw).toHaveBeenCalledWith(raw)
    expect(onIncomeDanmu).toHaveBeenCalledTimes(1)
    expect(onIncomeDanmu.mock.calls[0]?.[0].body.content).toBe('赞')
  })

  test('subscribes unknown raw event names through the raw fallback', () => {
    const onRaw = mock((_body: any) => undefined)
    const live = attach({ raw: { CUSTOM_EVENT: onRaw } })
    const body = { value: 1 }

    live.emit('CUSTOM_EVENT', { data: body })

    expect(onRaw).toHaveBeenCalledWith(body)
  })

  test('does not double-deliver PREPARING raw events', async () => {
    const raw = await readMock<any>('PREPARING/normal.json')
    const onRaw = mock((_body: any) => undefined)
    const live = attach({ raw: { PREPARING: onRaw } })

    live.emit('PREPARING', { data: raw })

    expect(live.listeners.get('PREPARING')).toHaveLength(1)
    expect(onRaw).toHaveBeenCalledTimes(1)
  })

  test('registers ROOM_ADMIN_REVOKE when only its raw handler is requested', async () => {
    const raw = await readMock<any>('ROOM_ADMIN_REVOKE/normal.json')
    const onRaw = mock((_body: any) => undefined)
    const live = attach({ raw: { ROOM_ADMIN_REVOKE: onRaw } })

    live.emit('ROOM_ADMIN_REVOKE', { data: raw })

    expect(live.listeners.get('ROOM_ADMIN_REVOKE')).toHaveLength(1)
    expect(onRaw).toHaveBeenCalledWith(raw)
  })

  test('normalizes browser Event errors for the public error handler', () => {
    const onError = mock((_error: Error) => undefined)
    const live = attach({ onError })

    live.emit('error', new Event('error'))

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error)
  })
})
