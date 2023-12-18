import {
  HEARTBEAT, type AttentionChangeMsgHandler,
  LIVE, type LiveStartMsgHandler, 
  PREPARING, type LiveStopMsgHandler,
  ANCHOR_LOT_AWARD, type AnchorLotteryEndMsgHandler,
  ANCHOR_LOT_START, type AnchorLotteryStartMsgHandler,
  DANMU_MSG, type DanmuMsgHandler,
  GUARD_BUY, type GuardBuyHandler,
  INTERACT_WORD, ENTRY_EFFECT, LIKE_INFO_V3_CLICK, type UserActionMsgHandler,
  LIKE_INFO_V3_UPDATE, type LikedChangeMsgHandler,
  ONLINE_RANK_COUNT, type RankCountChangeMsgHandler,
  POPULARITY_RED_POCKET_START, type RedPocketStartMsgHandler,
  POPULARITY_RED_POCKET_WINNER_LIST, type RedPocketEndMsgHandler,
  room_admin_entrance, ROOM_ADMIN_REVOKE, type RoomAdminSetMsgHandler,
  ROOM_CHANGE, type RoomInfoChangeHandler,
  ROOM_SILENT_ON, ROOM_SILENT_OFF, type RoomSilentMsgHandler,
  SEND_GIFT, type GiftHandler,
  SUPER_CHAT_MESSAGE, type SuperChatHandler,
  WARNING, CUT_OFF, type RoomWarnHandler,
  WATCHED_CHANGE, type WatchedChangeHandler,
} from '../parser'
import type { KeepLiveTCP, KeepLiveWS, Message as WSMessage } from 'tiny-bilibili-ws'
import type { KeepLiveWS as KeepLiveWSB } from 'tiny-bilibili-ws/browser'
import { normalizeDanmu } from '../utils/message'

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
  & AnchorLotteryEndMsgHandler
  & AnchorLotteryStartMsgHandler
  & DanmuMsgHandler
  & GuardBuyHandler
  & UserActionMsgHandler
  & LikedChangeMsgHandler
  & RankCountChangeMsgHandler
  & RedPocketStartMsgHandler
  & RedPocketEndMsgHandler
  & RoomAdminSetMsgHandler
  & RoomInfoChangeHandler
  & RoomSilentMsgHandler
  & GiftHandler
  & SuperChatHandler
  & RoomWarnHandler
  & WatchedChangeHandler
  & {
    /** 原始消息 */
    raw: Record<'msg' | string, (msg: any) => void>
  }
>

export const listenAll = (instance: KeepLiveTCP | KeepLiveWS | KeepLiveWSB, roomId: number, handler?: MsgHandler) => {
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
    instance.on(HEARTBEAT.eventName, (data) => {
      isHandleRaw && rawHandler[HEARTBEAT.eventName]?.(data)
      const parsedData = HEARTBEAT.parser(data)
      handler[HEARTBEAT.handlerName]?.(normalizeDanmu(HEARTBEAT.eventName, parsedData, data))
    })
  }

  // LIVE
  if (handler[LIVE.handlerName] || rawHandlerNames.has(LIVE.eventName)) {
    rawHandlerNames.delete(LIVE.eventName)
    instance.on(LIVE.eventName, (data) => {
      isHandleRaw && rawHandler[LIVE.eventName]?.(data.data)
      const parsedData = LIVE.parser(data.data)
      handler[LIVE.handlerName]?.(normalizeDanmu(LIVE.eventName, parsedData, data.data))
    })
  }

  // PREPARING
  if (handler[PREPARING.handlerName] || rawHandlerNames.has(PREPARING.eventName)) {
    rawHandlerNames.delete(LIVE.eventName)
    instance.on(PREPARING.eventName, (data) => {
      isHandleRaw && rawHandler[PREPARING.eventName]?.(data.data)
      const parsedData = PREPARING.parser(data.data)
      handler[PREPARING.handlerName]?.(normalizeDanmu(PREPARING.eventName, parsedData, data.data))
    })
  }

  // ANCHOR_LOT_AWARD
  if (handler[ANCHOR_LOT_AWARD.handlerName] || rawHandlerNames.has(ANCHOR_LOT_AWARD.eventName)) {
    rawHandlerNames.delete(ANCHOR_LOT_AWARD.eventName)
    instance.on(ANCHOR_LOT_AWARD.eventName, (data) => {
      isHandleRaw && rawHandler[ANCHOR_LOT_AWARD.eventName]?.(data.data)
      const parsedData = ANCHOR_LOT_AWARD.parser(data.data, roomId)
      handler[ANCHOR_LOT_AWARD.handlerName]?.(normalizeDanmu(ANCHOR_LOT_AWARD.eventName, parsedData, data.data))
    })
  }

  // ANCHOR_LOT_START
  if (handler[ANCHOR_LOT_START.handlerName] || rawHandlerNames.has(ANCHOR_LOT_START.eventName)) {
    rawHandlerNames.delete(ANCHOR_LOT_START.eventName)
    instance.on(ANCHOR_LOT_START.eventName, (data) => {
      isHandleRaw && rawHandler[ANCHOR_LOT_START.eventName]?.(data.data)
      const parsedData = ANCHOR_LOT_START.parser(data.data, roomId)
      handler[ANCHOR_LOT_START.handlerName]?.(normalizeDanmu(ANCHOR_LOT_START.eventName, parsedData, data.data))
    })
  }

  // DANMU_MSG
  if (handler[DANMU_MSG.handlerName] || rawHandlerNames.has(DANMU_MSG.eventName)) {
    rawHandlerNames.delete(DANMU_MSG.eventName)
    instance.on(DANMU_MSG.eventName, (data) => {
      isHandleRaw && rawHandler[DANMU_MSG.eventName]?.(data.data)
      const parsedData = DANMU_MSG.parser(data.data, roomId)
      handler[DANMU_MSG.handlerName]?.(normalizeDanmu(DANMU_MSG.eventName, parsedData, data.data))
    })
  }

  // GUARD_BUY
  if (handler[GUARD_BUY.handlerName] || rawHandlerNames.has(GUARD_BUY.eventName)) {
    rawHandlerNames.delete(GUARD_BUY.eventName)
    instance.on(GUARD_BUY.eventName, (data) => {
      isHandleRaw && rawHandler[GUARD_BUY.eventName]?.(data.data)
      const parsedData = GUARD_BUY.parser(data.data)
      handler[GUARD_BUY.handlerName]?.(normalizeDanmu(GUARD_BUY.eventName, parsedData, data.data))
    })
  }

  // INTERACT_WORD, ENTRY_EFFECT, LIKE_INFO_V3_CLICK
  if (handler[INTERACT_WORD.handlerName] || handler[ENTRY_EFFECT.handlerName] || handler[LIKE_INFO_V3_CLICK.handlerName] ||
    rawHandlerNames.has(INTERACT_WORD.eventName) || rawHandlerNames.has(ENTRY_EFFECT.eventName) || rawHandlerNames.has(LIKE_INFO_V3_CLICK.eventName)) {
    rawHandlerNames.delete(INTERACT_WORD.eventName)
    rawHandlerNames.delete(ENTRY_EFFECT.eventName)
    rawHandlerNames.delete(LIKE_INFO_V3_CLICK.eventName)
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
    instance.on(LIKE_INFO_V3_CLICK.eventName, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[LIKE_INFO_V3_CLICK.eventName]?.(data.data)
      const parsedData = LIKE_INFO_V3_CLICK.parser(data.data, roomId)
      handler[LIKE_INFO_V3_CLICK.handlerName]?.(normalizeDanmu(LIKE_INFO_V3_CLICK.eventName, parsedData, data.data))
    })
  }

  // LIKE_INFO_V3_UPDATE
  if (handler[LIKE_INFO_V3_UPDATE.handlerName] || rawHandlerNames.has(LIKE_INFO_V3_UPDATE.eventName)) {
    rawHandlerNames.delete(LIKE_INFO_V3_UPDATE.eventName)
    instance.on(LIKE_INFO_V3_UPDATE.eventName, (data) => {
      isHandleRaw && rawHandler[LIKE_INFO_V3_UPDATE.eventName]?.(data.data)
      const parsedData = LIKE_INFO_V3_UPDATE.parser(data.data)
      handler[LIKE_INFO_V3_UPDATE.handlerName]?.(normalizeDanmu(LIKE_INFO_V3_UPDATE.eventName, parsedData, data.data))
    })
  }

  // ONLINE_RANK_COUNT
  if (handler[ONLINE_RANK_COUNT.handlerName] || rawHandlerNames.has(ONLINE_RANK_COUNT.eventName)) {
    rawHandlerNames.delete(ONLINE_RANK_COUNT.eventName)
    instance.on(ONLINE_RANK_COUNT.eventName, (data) => {
      isHandleRaw && rawHandler[ONLINE_RANK_COUNT.eventName]?.(data.data)
      const parsedData = ONLINE_RANK_COUNT.parser(data.data)
      handler[ONLINE_RANK_COUNT.handlerName]?.(normalizeDanmu(ONLINE_RANK_COUNT.eventName, parsedData, data.data))
    })
  }

  // POPULARITY_RED_POCKET_START
  if (handler[POPULARITY_RED_POCKET_START.handlerName] || rawHandlerNames.has(POPULARITY_RED_POCKET_START.eventName)) {
    rawHandlerNames.delete(POPULARITY_RED_POCKET_START.eventName)
    instance.on(POPULARITY_RED_POCKET_START.eventName, (data) => {
      isHandleRaw && rawHandler[POPULARITY_RED_POCKET_START.eventName]?.(data.data)
      const parsedData = POPULARITY_RED_POCKET_START.parser(data.data, roomId)
      handler[POPULARITY_RED_POCKET_START.handlerName]?.(normalizeDanmu(POPULARITY_RED_POCKET_START.eventName, parsedData, data.data))
    })
  }

  // POPULARITY_RED_POCKET_WINNER_LIST
  if (handler[POPULARITY_RED_POCKET_WINNER_LIST.handlerName] || rawHandlerNames.has(POPULARITY_RED_POCKET_WINNER_LIST.eventName)) {
    rawHandlerNames.delete(POPULARITY_RED_POCKET_WINNER_LIST.eventName)
    instance.on(POPULARITY_RED_POCKET_WINNER_LIST.eventName, (data) => {
      isHandleRaw && rawHandler[POPULARITY_RED_POCKET_WINNER_LIST.eventName]?.(data.data)
      const parsedData = POPULARITY_RED_POCKET_WINNER_LIST.parser(data.data, roomId)
      handler[POPULARITY_RED_POCKET_WINNER_LIST.handlerName]?.(normalizeDanmu(POPULARITY_RED_POCKET_WINNER_LIST.eventName, parsedData, data.data))
    })
  }

  // room_admin_entrance, ROOM_ADMIN_REVOKE
  if (handler[room_admin_entrance.handlerName] || handler[ROOM_ADMIN_REVOKE.handlerName] || rawHandlerNames.has(room_admin_entrance.eventName) || rawHandlerNames.has(ROOM_SILENT_OFF.eventName)) {
    rawHandlerNames.delete(room_admin_entrance.eventName)
    rawHandlerNames.delete(ROOM_ADMIN_REVOKE.eventName)
    instance.on(room_admin_entrance.eventName as any, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[room_admin_entrance.eventName]?.(data.data)
      const parsedData = room_admin_entrance.parser(data.data, roomId)
      handler[room_admin_entrance.handlerName]?.(normalizeDanmu(room_admin_entrance.eventName, parsedData, data.data))
    })
    instance.on(ROOM_ADMIN_REVOKE.eventName as any, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[ROOM_ADMIN_REVOKE.eventName]?.(data.data)
      const parsedData = ROOM_ADMIN_REVOKE.parser(data.data, roomId)
      handler[ROOM_ADMIN_REVOKE.handlerName]?.(normalizeDanmu(ROOM_ADMIN_REVOKE.eventName, parsedData, data.data))
    })
  }

  // ROOM_CHANGE
  if (handler[ROOM_CHANGE.handlerName] || rawHandlerNames.has(ROOM_CHANGE.eventName)) {
    rawHandlerNames.delete(ROOM_CHANGE.eventName)
    instance.on(ROOM_CHANGE.eventName, (data) => {
      isHandleRaw && rawHandler[ROOM_CHANGE.eventName]?.(data.data)
      const parsedData = ROOM_CHANGE.parser(data.data)
      handler[ROOM_CHANGE.handlerName]?.(normalizeDanmu(ROOM_CHANGE.eventName, parsedData, data.data))
    })
  }

  // ROOM_SILENT_ON, ROOM_SILENT_OFF
  if (handler[ROOM_SILENT_ON.handlerName] || handler[ROOM_SILENT_OFF.handlerName] || rawHandlerNames.has(ROOM_SILENT_ON.eventName) || rawHandlerNames.has(ROOM_SILENT_OFF.eventName)) {
    rawHandlerNames.delete(ROOM_SILENT_ON.eventName)
    rawHandlerNames.delete(ROOM_SILENT_OFF.eventName)
    instance.on(ROOM_SILENT_ON.eventName as any, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[ROOM_SILENT_ON.eventName]?.(data.data)
      const parsedData = ROOM_SILENT_ON.parser(data.data, roomId)
      handler[ROOM_SILENT_ON.handlerName]?.(normalizeDanmu(ROOM_SILENT_ON.eventName, parsedData, data.data))
    })
    instance.on(ROOM_SILENT_OFF.eventName as any, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[ROOM_SILENT_OFF.eventName]?.(data.data)
      const parsedData = ROOM_SILENT_OFF.parser(data.data, roomId)
      handler[ROOM_SILENT_OFF.handlerName]?.(normalizeDanmu(ROOM_SILENT_OFF.eventName, parsedData, data.data))
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
    instance.on(SUPER_CHAT_MESSAGE.eventName, (data) => {
      isHandleRaw && rawHandler[SUPER_CHAT_MESSAGE.eventName]?.(data.data)
      const parsedData = SUPER_CHAT_MESSAGE.parser(data.data, roomId)
      handler[SUPER_CHAT_MESSAGE.handlerName]?.(normalizeDanmu(SUPER_CHAT_MESSAGE.eventName, parsedData, data.data))
    })
  }

  // WARNING, CUT_OFF
  if (handler[WARNING.handlerName] || handler[CUT_OFF.handlerName] || rawHandlerNames.has(WARNING.eventName) || rawHandlerNames.has(CUT_OFF.eventName)) {
    rawHandlerNames.delete(WARNING.eventName)
    rawHandlerNames.delete(CUT_OFF.eventName)
    instance.on(WARNING.eventName as any, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[WARNING.eventName]?.(data.data)
      const parsedData = WARNING.parser(data.data, roomId)
      handler[WARNING.handlerName]?.(normalizeDanmu(WARNING.eventName, parsedData, data.data))
    })
    instance.on(CUT_OFF.eventName as any, (data: WSMessage<any>) => {
      isHandleRaw && rawHandler[CUT_OFF.eventName]?.(data.data)
      const parsedData = CUT_OFF.parser(data.data, roomId)
      handler[CUT_OFF.handlerName]?.(normalizeDanmu(CUT_OFF.eventName, parsedData, data.data))
    })
  }

  // WATCHED_CHANGE
  if (handler[WATCHED_CHANGE.handlerName] || rawHandlerNames.has(WATCHED_CHANGE.eventName)) {
    rawHandlerNames.delete(WATCHED_CHANGE.eventName)
    instance.on(WATCHED_CHANGE.eventName, (data) => {
      isHandleRaw && rawHandler[WATCHED_CHANGE.eventName]?.(data.data)
      const parsedData = WATCHED_CHANGE.parser(data.data)
      handler[WATCHED_CHANGE.handlerName]?.(normalizeDanmu(WATCHED_CHANGE.eventName, parsedData, data.data))
    })
  }

  // Rest raw events
  for (const eventName of rawHandlerNames) {
    instance.on(eventName as any, (data: WSMessage<any>) => {
      rawHandler[eventName]?.(data.data)
    })
  }
}
