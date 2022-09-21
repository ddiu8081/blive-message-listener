import {
  DANMU_MSG, type DanmuMsgHandler,
  GUARD_BUY, type GuardBuyHandler,
  SEND_GIFT, type GiftHandler,
} from '../parser'
import type { Danmu, BaseMsg } from '../app'
import type { KeepLiveTCP } from 'bilibili-live-ws'

export type MsgHandler = Partial<
  & DanmuMsgHandler
  & GuardBuyHandler
  & GiftHandler
>

const normalizeDanmu = <T extends BaseMsg>(msgType: string, data: T): Danmu<T> => {
  const timestamp = Date.now()
  const id = `${timestamp}_${msgType}_${data.user?.uid}`
  return {
    id,
    timestamp,
    type: msgType,
    data,
  }
}

export const listenAll = (instance: KeepLiveTCP, handler?: MsgHandler) => {
  if (!handler) return

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
}
