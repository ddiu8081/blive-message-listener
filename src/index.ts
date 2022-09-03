import { KeepLiveTCP } from 'bilibili-live-ws'
import type { RoomMsgHandler, DanmuMsg } from './app'

import parser from './parser'

export const openRoom = (roomId: number, handler: RoomMsgHandler) => {
  const live = new KeepLiveTCP(roomId)

  // live.on('open', () => console.log('Connection is established'))

  live.on('heartbeat', online => {
    handler.onHeartbeat?.(online)
  })

  live.on('DANMU_MSG', data => {
    handler.onIncomeDanmuRaw?.(data)
    handler.onIncomeDanmu?.(parser.DANMU_MSG(data))
  })

  live.on('WATCHED_CHANGE', data => {
    handler.onWatchedChangeRaw?.(data)
    handler.onWatchedChange?.(parser.WATCHED_CHANGE(data))
  })

  live.on('SUPER_CHAT_MESSAGE', data => {
    handler.onIncomeSuperChatRaw?.(data)
    handler.onIncomeSuperChat?.(parser.SUPER_CHAT_MESSAGE(data))
  })
  
  live.on('GUARD_BUY', data => {
    handler.onGuardBuyRaw?.(data)
    handler.onGuardBuy?.(parser.GUARD_BUY(data))
  })
}

export type MsgHandler = RoomMsgHandler
export type { DanmuMsg }