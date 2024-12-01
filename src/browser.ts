import { KeepLiveWS } from 'tiny-bilibili-ws/browser'
import { listenAll, type MsgHandler } from './listener'
import type { MessageListener } from '.'
import type { BrowserWSOptions } from 'tiny-bilibili-ws/browser'

interface MessageListenerWSOptions {
  /**
   * tiny-bilibili-ws 连接选项
   *
   * @see https://github.com/starknt/tiny-bilibili-ws
   */
  ws?: BrowserWSOptions
}

export const startListen = (roomId: number, handler: MsgHandler, options?: MessageListenerWSOptions) => {
  const live = new KeepLiveWS(roomId, options?.ws!)

  listenAll(live, roomId, handler)

  const listenerInstance: MessageListener = {
    live: live,
    roomId: live.roomId,
    online: live.online,
    closed: live.closed,
    close: () => live.close(),
    getAttention: () => live.getOnline(),
    getOnline: () => live.getOnline(),
    reconnect: () => live.reconnect(),
    heartbeat: () => live.heartbeat(),
    send: (op, data) => live.send(op, data),
  }

  return listenerInstance
}
