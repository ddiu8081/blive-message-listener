import type { Message } from '../types/app'

export const normalizeDanmu = <T>(msgType: string, body: T, rawBody: any): Message<T> => {
  const timestamp = Date.now()
  const randomText = Math.floor(Math.random() * 10000).toString()
  // @ts-ignore
  const id = `${timestamp}:${msgType}:${body.user?.uid}:${randomText}`
  return {
    id,
    timestamp,
    type: msgType,
    body,
    raw: rawBody,
  }
}
