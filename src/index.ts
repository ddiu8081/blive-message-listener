import { KeepLiveTCP } from 'bilibili-live-ws'
import type { RoomMsgHandler } from './app'

import listener from './listener'

export const openRoom = (roomId: number, handler: RoomMsgHandler) => {
  const live = new KeepLiveTCP(roomId)

  // live.on('open', () => console.log('Connection is established'))

  // live.on('heartbeat', online => {
  //   handler.onHeartbeat?.(online)
  // })

  // live.on('DANMU_MSG', data => {
  //   handler.onIncomeDanmuRaw?.(data)
  //   handler.onIncomeDanmu?.(parser.DANMU_MSG(data))
  // })
}

export type MsgHandler = RoomMsgHandler
export type { DanmuMsg }