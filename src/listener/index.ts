import {
  HEARTBEAT, type AttentionChangeMsgHandler,
  LIVE, type LiveStartMsgHandler, 
  PREPARING, type LiveStopMsgHandler,
  DANMU_MSG, DANMU_MSG_402220, type DanmuMsgHandler,
  GUARD_BUY, type GuardBuyHandler,
  INTERACT_WORD, ENTRY_EFFECT, type UserActionMsgHandler,
  LIKE_INFO_V3_UPDATE, type LikedChangeMsgHandler,
  ONLINE_RANK_COUNT, type RankCountChangeMsgHandler,
  ROOM_CHANGE, type RoomInfoChangeHandler,
  SEND_GIFT, type GiftHandler,
  SUPER_CHAT_MESSAGE, type SuperChatHandler,
  WATCHED_CHANGE, type WatchedChangeHandler,
} from '../parser'
import type { KeepLiveTCP, KeepLiveWS, Message as WSMessage } from 'tiny-bilibili-ws'
import { normalizeDanmu, checkIsDuplicateDanmuMsg } from '../utils/message'

export type MsgHandler = Partial<
  {
    /** 连接成功 */
    onOpen: () => void,
    /** 连接关闭 */
    onClose: () => void,
    /** 连接错误 */
    onError: (e: Error) => void,
    /** 开始监听消息 */
    onStartListen: () => void,
  }
  & AttentionChangeMsgHandler
  & LiveStartMsgHandler
  & LiveStopMsgHandler
  & DanmuMsgHandler
  & GuardBuyHandler
  & UserActionMsgHandler
  & LikedChangeMsgHandler
  & RankCountChangeMsgHandler
  & RoomInfoChangeHandler
  & GiftHandler
  & SuperChatHandler
  & WatchedChangeHandler
  & {
    /** 原始消息 */
    raw: Record<string, (msg: any) => void>
  }
>

export const listenAll = (instance: KeepLiveTCP | KeepLiveWS, roomId: number, handler?: MsgHandler) => {
  if (!handler) return

  // Raw message handler
  const rawHandler = handler.raw || {}
  const rawHandlerNames = new Set(Object.keys(rawHandler))
  const isHandleRaw = rawHandlerNames.size > 0

  // Common
  if (handler.onOpen) {
    instance.on('open', () => {
      handler.onOpen?.()
    })
  }
  if (handler.onClose) {
    instance.on('close', () => {
      handler.onClose?.()
    })
  }
  if (handler.onStartListen) {
    instance.on('live', () => {
      handler.onStartListen?.()
    })
  }

  // HEARTBEAT
  if (handler[HEARTBEAT.handlerName] || rawHandlerNames.has(HEARTBEAT.eventName)) {
    rawHandlerNames.delete(HEARTBEAT.eventName)
    instance.on(HEARTBEAT.eventName, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[HEARTBEAT.eventName]?.(data.data)
      const parsedData = HEARTBEAT.parser(data.data)
      handler[HEARTBEAT.handlerName]?.(normalizeDanmu(HEARTBEAT.eventName, parsedData, data.data))
    })
  }

  // LIVE
  if (handler[LIVE.handlerName] || rawHandlerNames.has(LIVE.eventName)) {
    rawHandlerNames.delete(LIVE.eventName)
    instance.on(LIVE.eventName, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[LIVE.eventName]?.(data.data)
      const parsedData = LIVE.parser(data.data)
      handler[LIVE.handlerName]?.(normalizeDanmu(LIVE.eventName, parsedData, data.data))
    })
  }

  // PREPARING
  if (handler[PREPARING.handlerName] || rawHandlerNames.has(PREPARING.eventName)) {
    rawHandlerNames.delete(LIVE.eventName)
    instance.on(PREPARING.eventName, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[PREPARING.eventName]?.(data.data)
      const parsedData = PREPARING.parser(data.data)
      handler[PREPARING.handlerName]?.(normalizeDanmu(PREPARING.eventName, parsedData, data.data))
    })
  }

  // DANMU_MSG
  if (handler[DANMU_MSG.handlerName] || rawHandlerNames.has(DANMU_MSG.eventName) || rawHandlerNames.has(DANMU_MSG_402220.eventName)) {
    rawHandlerNames.delete(DANMU_MSG.eventName)
    rawHandlerNames.delete(DANMU_MSG_402220.eventName)
    const msgCallback = handler[DANMU_MSG.handlerName]!
    const handleDanmuMsg = (data: WSMessage<any>) => {
      const parsedData = DANMU_MSG.parser(data.data, roomId)
      if (checkIsDuplicateDanmuMsg(parsedData)) return
      msgCallback(normalizeDanmu(DANMU_MSG.eventName, parsedData, data.data))
    }
    instance.on(DANMU_MSG.eventName, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[DANMU_MSG.eventName]?.(data.data)
      handleDanmuMsg(data)
    })
    instance.on(DANMU_MSG_402220.eventName, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[DANMU_MSG_402220.eventName]?.(data.data)
      handleDanmuMsg(data)
    })
  }

  // GUARD_BUY
  if (handler[GUARD_BUY.handlerName] || rawHandlerNames.has(GUARD_BUY.eventName)) {
    rawHandlerNames.delete(GUARD_BUY.eventName)
    instance.on(GUARD_BUY.eventName, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[GUARD_BUY.eventName]?.(data.data)
      const parsedData = GUARD_BUY.parser(data.data)
      handler[GUARD_BUY.handlerName]?.(normalizeDanmu(GUARD_BUY.eventName, parsedData, data.data))
    })
  }

  // INTERACT_WORD, ENTRY_EFFECT
  if (handler[INTERACT_WORD.handlerName] || handler[ENTRY_EFFECT.handlerName] || rawHandlerNames.has(INTERACT_WORD.eventName) || rawHandlerNames.has(ENTRY_EFFECT.eventName)) {
    rawHandlerNames.delete(INTERACT_WORD.eventName)
    rawHandlerNames.delete(ENTRY_EFFECT.eventName)
    instance.on(INTERACT_WORD.eventName, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[INTERACT_WORD.eventName]?.(data.data)
      const parsedData = INTERACT_WORD.parser(data.data, roomId)
      handler[INTERACT_WORD.handlerName]?.(normalizeDanmu(INTERACT_WORD.eventName, parsedData, data.data))
    })
    instance.on(ENTRY_EFFECT.eventName, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[ENTRY_EFFECT.eventName]?.(data.data)
      const parsedData = ENTRY_EFFECT.parser(data.data, roomId)
      handler[ENTRY_EFFECT.handlerName]?.(normalizeDanmu(ENTRY_EFFECT.eventName, parsedData, data.data))
    })
  }

  // LIKE_INFO_V3_UPDATE
  if (handler[LIKE_INFO_V3_UPDATE.handlerName] || rawHandlerNames.has(LIKE_INFO_V3_UPDATE.eventName)) {
    rawHandlerNames.delete(LIKE_INFO_V3_UPDATE.eventName)
    instance.on(LIKE_INFO_V3_UPDATE.eventName, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[LIKE_INFO_V3_UPDATE.eventName]?.(data.data)
      const parsedData = LIKE_INFO_V3_UPDATE.parser(data.data)
      handler[LIKE_INFO_V3_UPDATE.handlerName]?.(normalizeDanmu(LIKE_INFO_V3_UPDATE.eventName, parsedData, data.data))
    })
  }

  // ONLINE_RANK_COUNT
  if (handler[ONLINE_RANK_COUNT.handlerName] || rawHandlerNames.has(ONLINE_RANK_COUNT.eventName)) {
    rawHandlerNames.delete(ONLINE_RANK_COUNT.eventName)
    instance.on(ONLINE_RANK_COUNT.eventName, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[ONLINE_RANK_COUNT.eventName]?.(data.data)
      const parsedData = ONLINE_RANK_COUNT.parser(data.data)
      handler[ONLINE_RANK_COUNT.handlerName]?.(normalizeDanmu(ONLINE_RANK_COUNT.eventName, parsedData, data.data))
    })
  }

  // ROOM_CHANGE
  if (handler[ROOM_CHANGE.handlerName] || rawHandlerNames.has(ROOM_CHANGE.eventName)) {
    rawHandlerNames.delete(ROOM_CHANGE.eventName)
    instance.on(ROOM_CHANGE.eventName, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[ROOM_CHANGE.eventName]?.(data.data)
      const parsedData = ROOM_CHANGE.parser(data.data)
      handler[ROOM_CHANGE.handlerName]?.(normalizeDanmu(ROOM_CHANGE.eventName, parsedData, data.data))
    })
  }

  // SEND_GIFT
  if (handler[SEND_GIFT.handlerName] || rawHandlerNames.has(SEND_GIFT.eventName)) {
    rawHandlerNames.delete(SEND_GIFT.eventName)
    instance.on(SEND_GIFT.eventName, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[SEND_GIFT.eventName]?.(data.data)
      const parsedData = SEND_GIFT.parser(data.data)
      handler[SEND_GIFT.handlerName]?.(normalizeDanmu(SEND_GIFT.eventName, parsedData, data.data))
    })
  }

  // SUPER_CHAT_MESSAGE
  if (handler[SUPER_CHAT_MESSAGE.handlerName] || rawHandlerNames.has(SUPER_CHAT_MESSAGE.eventName)) {
    rawHandlerNames.delete(SUPER_CHAT_MESSAGE.eventName)
    instance.on(SUPER_CHAT_MESSAGE.eventName, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[SUPER_CHAT_MESSAGE.eventName]?.(data.data)
      const parsedData = SUPER_CHAT_MESSAGE.parser(data.data, roomId)
      handler[SUPER_CHAT_MESSAGE.handlerName]?.(normalizeDanmu(SUPER_CHAT_MESSAGE.eventName, parsedData, data.data))
    })
  }

  // WATCHED_CHANGE
  if (handler[WATCHED_CHANGE.handlerName] || rawHandlerNames.has(WATCHED_CHANGE.eventName)) {
    rawHandlerNames.delete(WATCHED_CHANGE.eventName)
    instance.on(WATCHED_CHANGE.eventName, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[WATCHED_CHANGE.eventName]?.(data.data)
      const parsedData = WATCHED_CHANGE.parser(data.data)
      handler[WATCHED_CHANGE.handlerName]?.(normalizeDanmu(WATCHED_CHANGE.eventName, parsedData, data.data))
    })
  }

  // Rest raw events
  rawHandlerNames.forEach((eventName) => {
    console.log('rest', eventName)
    instance.on(eventName, (data: WSMessage<any>) => {
      rawHandler[eventName](data.data)
    })
  })
}
