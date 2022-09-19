import {
  DANMU_MSG,
  GUARD_BUY,
} from '../parser'
import type { Danmu, BaseMsg } from '../app'
import type { KeepLiveTCP } from 'bilibili-live-ws'

const supported = [
  DANMU_MSG,
  GUARD_BUY,
]

const supportedHandlerName = [
  'onIncomeDanmu',
  'onGuardBuy',
] as const

type EventName = typeof supportedHandlerName[number]

type MsgHandler = {
  [key in EventName]: (data: Danmu<BaseMsg>) => void
}

const normalizeDanmu = <T extends BaseMsg>(data: T): Danmu<T> => {
  const timestamp = Date.now()
  const id = `${timestamp}_${data.user.uid}`
  return {
    id,
    timestamp,
    type: 'data.type',
    data,
  }
}

const parseDanmu = (data: any, parser: DanmuHandler['parser']): Danmu<BaseMsg> => {

export const listenAll = (instance: KeepLiveTCP, handler?: MsgHandler) => {
  if (!handler) return
  supported.forEach((item) => {
    if (handler[item.handlerName]) {
      instance.on(item.eventName, (data: any) => {
        const danmu = normalizeDanmu(item.parser(data))
        handler[item.handlerName](danmu)
      })
    }
  })
  // if (handler.onIncomeDanmu) {
  //   instance.on(eventName, data => {
  //     handler[handlerNameRaw]?.(data)
  //     handler[handlerName]?.(parser(data))
  //   })
  // }
  // supported.forEach(({ eventName, handlerName, handlerNameRaw, parser }) => {
  //   if (handler[handlerName] || handler[handlerNameRaw]) {

  //   }
  // })
}
