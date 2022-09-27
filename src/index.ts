import { KeepLiveTCP } from 'tiny-bilibili-ws'

import { listenAll, type MsgHandler } from './listener'

export interface MessageListener {
  /** 直播间房间号 */
  roomId: number
  /** 关闭连接 */
  close: () => void
  /** 刷新当前直播间热度 */
  getAttention: () => Promise<number>
}

export const startListen = (roomId: number, handler: MsgHandler) => {
  const live = new KeepLiveTCP(roomId)

  listenAll(live, roomId, handler)

  const listenerInstance: MessageListener = {
    roomId: live.roomId,
    close: () => live.close(),
    getAttention: () => live.getOnline(),
  }

  return listenerInstance
}

export type { MsgHandler }
export type { Message, GuardLevel, User } from './types/app'
export * from './types/message'
