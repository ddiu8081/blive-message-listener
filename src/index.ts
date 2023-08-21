import { KeepLiveTCP } from 'tiny-bilibili-ws'
import { listenAll, type MsgHandler } from './listener'
import type { TCPOptions } from 'tiny-bilibili-ws'

export interface MessageListener {
  /** 直播间房间号 */
  roomId: number
  /** 关闭连接 */
  close: () => void
  /** 刷新当前直播间热度 */
  getAttention: () => Promise<number>
}

interface MessageListenerTCPOptions {
  /**
   * tiny-bilibili-ws 连接选项
   *
   * @see https://github.com/starknt/tiny-bilibili-ws
   */
  ws?: TCPOptions
}

export const startListen = (roomId: number, handler: MsgHandler, options?: MessageListenerTCPOptions) => {
  const live = new KeepLiveTCP(roomId, options?.ws)

  listenAll(live, roomId, handler)

  const listenerInstance: MessageListener = {
    roomId: live.roomId,
    close: () => live.close(),
    getAttention: () => live.getOnline(),
  }

  return listenerInstance
}

export type { MsgHandler }
export type { Message, User } from './types/app'
export { GuardLevel } from './types/const'
export * from './types/message'
