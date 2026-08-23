import type { TCPOptions, WS_OP } from 'tiny-bilibili-ws'
import { KeepLiveTCP } from 'tiny-bilibili-ws'
import type { KeepLiveWS } from 'tiny-bilibili-ws/browser'
import type * as Listener from './listener'
import { listenAll } from './listener'

export interface MessageListener {
  /** 关闭连接 */
  close: () => void
  /** 是否关闭 */
  closed: boolean
  /** 刷新当前直播间热度 */
  getAttention: () => Promise<number>
  /** 刷新当前直播间热度 */
  getOnline: () => Promise<number>
  /** 发送心跳 */
  heartbeat: () => void
  /** tiny-bilibili-ws 实例 */
  live: KeepLiveTCP | KeepLiveWS
  /** 人气值 */
  online: number
  /** 重新连接 */
  reconnect: () => void
  /** 直播间房间号 */
  roomId: number
  /** 发送消息 */
  send: (op: WS_OP, data?: Record<string, any> | string) => void
}

interface MessageListenerTCPOptions {
  /**
   * tiny-bilibili-ws 连接选项
   *
   * @see https://github.com/starknt/tiny-bilibili-ws
   */
  ws?: TCPOptions
}

export const startListen = (
  roomId: number,
  handler: Listener.MsgHandler,
  options?: MessageListenerTCPOptions
) => {
  const live = new KeepLiveTCP(roomId, options?.ws)

  listenAll(live, roomId, handler)

  const listenerInstance: MessageListener = {
    close: () => live.close(),
    get closed() {
      return live.closed
    },
    getAttention: () => live.getOnline(),
    getOnline: () => live.getOnline(),
    heartbeat: () => live.heartbeat(),
    live,
    get online() {
      return live.online
    },
    reconnect: () => live.reconnect(),
    roomId: live.roomId,
    send: (op, data) => live.send(op, data),
  }

  return listenerInstance
}

export type { MsgHandler } from './listener'
export type { Message, User } from './types/app'
export { GuardLevel } from './types/const'
export * from './types/message'
