import type { Message } from '../types/app'

export const normalizeDanmu = <T>(msgType: string, body: T, rawBody: any): Message<T> => {
  const timestamp = Date.now()
  const randomText = Math.floor(Math.random() * 10_000).toString()
  // @ts-expect-error
  const id = `${timestamp}:${msgType}:${body.user?.uid}:${randomText}`
  return {
    body,
    id,
    raw: rawBody,
    timestamp,
    type: msgType,
  }
}
