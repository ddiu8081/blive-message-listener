import {
  HEARTBEAT, type AttentionChangeMsgHandler,
  DANMU_MSG, type DanmuMsgHandler,
  GUARD_BUY, type GuardBuyHandler,
  SEND_GIFT, type GiftHandler,
  SUPER_CHAT_MESSAGE, type SuperChatHandler,
  WATCHED_CHANGE, type WatchedChangeHandler,
} from '../parser'
import type { Message } from '../types/app'
import type { KeepLiveTCP } from 'bilibili-live-ws'

export type MsgHandler = Partial<
  & AttentionChangeMsgHandler
  & DanmuMsgHandler
  & GuardBuyHandler
  & GiftHandler
  & SuperChatHandler
  & WatchedChangeHandler
>

const normalizeDanmu = <T>(msgType: string, body: T): Message<T> => {
  const timestamp = Date.now()
  // @ts-ignore
  const id = `${timestamp}_${msgType}_${body.user?.uid}`
  return {
    id,
    timestamp,
    type: msgType,
    body,
  }
}

export const listenAll = (instance: KeepLiveTCP, handler?: MsgHandler) => {
  if (!handler) return

  // HEARTBEAT
  if (handler[HEARTBEAT.handlerName]) {
    instance.on(HEARTBEAT.eventName, (data: any) => {
      const parsedData = HEARTBEAT.parser(data)
      handler[HEARTBEAT.handlerName]?.(normalizeDanmu(HEARTBEAT.eventName, parsedData))
    })
  }

  // DANMU_MSG
  if (handler[DANMU_MSG.handlerName]) {
    instance.on(DANMU_MSG.eventName, (data: any) => {
      const parsedData = DANMU_MSG.parser(data)
      handler[DANMU_MSG.handlerName]?.(normalizeDanmu(DANMU_MSG.eventName, parsedData))
    })
  }

  // GUARD_BUY
  if (handler[GUARD_BUY.handlerName]) {
    instance.on(GUARD_BUY.eventName, (data: any) => {
      const parsedData = GUARD_BUY.parser(data)
      handler[GUARD_BUY.handlerName]?.(normalizeDanmu(GUARD_BUY.eventName, parsedData))
    })
  }

  // SEND_GIFT
  if (handler[SEND_GIFT.handlerName]) {
    instance.on(SEND_GIFT.eventName, (data: any) => {
      const parsedData = SEND_GIFT.parser(data)
      handler[SEND_GIFT.handlerName]?.(normalizeDanmu(SEND_GIFT.eventName, parsedData))
    })
  }

  // SUPER_CHAT_MESSAGE
  if (handler[SUPER_CHAT_MESSAGE.handlerName]) {
    instance.on(SUPER_CHAT_MESSAGE.eventName, (data: any) => {
      const parsedData = SUPER_CHAT_MESSAGE.parser(data)
      handler[SUPER_CHAT_MESSAGE.handlerName]?.(normalizeDanmu(SUPER_CHAT_MESSAGE.eventName, parsedData))
    })
  }

  // WATCHED_CHANGE
  if (handler[WATCHED_CHANGE.handlerName]) {
    instance.on(WATCHED_CHANGE.eventName, (data: any) => {
      const parsedData = WATCHED_CHANGE.parser(data)
      handler[WATCHED_CHANGE.handlerName]?.(normalizeDanmu(WATCHED_CHANGE.eventName, parsedData))
    })
  }
}
