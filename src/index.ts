import { KeepLiveTCP, KeepLiveWS } from 'tiny-bilibili-ws'
import { listenAll, type MsgHandler } from './listener'
import type { TCPOptions, WSOptions, WS_OP } from 'tiny-bilibili-ws'
import type { KeepLiveWS as BrowserKeepLiveWS } from 'tiny-bilibili-ws/browser'

export interface MessageListener {
  /** tiny-bilibili-ws 实例 */
  live: KeepLiveTCP | KeepLiveWS | BrowserKeepLiveWS
  /** 直播间房间号 */
  roomId: number
  /** 人气值 */
  online: number
  /** 是否关闭 */
  closed: boolean
  /** 关闭连接 */
  close: () => void
  /** 刷新当前直播间热度 */
  getAttention: () => Promise<number>
  /** 刷新当前直播间热度 */
  getOnline: () => Promise<number>
  /** 重新连接 */
  reconnect: () => void
  /** 发送心跳 */
  heartbeat: () => void
  /** 发送消息 */
  send: (op: WS_OP, data?: Record<string, any> | string) => void
}

interface MessageListenerTCPOptions {
  /** 连接方式，默认使用 TCP */
  transport?: 'tcp'
  /**
   * tiny-bilibili-ws 连接选项
   *
   * @see https://github.com/starknt/tiny-bilibili-ws
   */
  ws?: TCPOptions
}

interface MessageListenerWSOptions {
  /** 使用 WebSocket 连接 */
  transport: 'ws'
  /**
   * tiny-bilibili-ws 连接选项
   *
   * @see https://github.com/starknt/tiny-bilibili-ws
   */
  ws?: WSOptions
}

type MessageListenerOptions = MessageListenerTCPOptions | MessageListenerWSOptions

export const startListen = (roomId: number, handler: MsgHandler, options?: MessageListenerOptions) => {
  const live = options?.transport === 'ws'
    ? new KeepLiveWS(roomId, options.ws)
    : new KeepLiveTCP(roomId, options?.ws)

  listenAll(live, roomId, handler)

  const listenerInstance: MessageListener = {
    live: live,
    roomId: live.roomId,
    get online() { return live.online },
    get closed() { return live.closed },
    close: () => live.close(),
    getAttention: () => live.getOnline(),
    getOnline: () => live.getOnline(),
    reconnect: () => live.reconnect(),
    heartbeat: () => live.heartbeat(),
    send: (op, data) => live.send(op, data),
  }

  return listenerInstance
}

export type { MsgHandler }
export type { Message, User } from './types/app'
export { GuardLevel } from './types/const'
export * from './types/message'
