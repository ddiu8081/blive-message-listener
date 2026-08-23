import type { BrowserWSOptions } from 'tiny-bilibili-ws/browser'
import { KeepLiveWS } from 'tiny-bilibili-ws/browser'
import type { MessageListener } from '.'
import { listenAll, type MsgHandler } from './listener'

interface MessageListenerWSOptions {
  /**
   * tiny-bilibili-ws 连接选项
   *
   * @see https://github.com/starknt/tiny-bilibili-ws
   */
  ws?: BrowserWSOptions
}

export const startListen = (
  roomId: number,
  handler: MsgHandler,
  options?: MessageListenerWSOptions
) => {
  if (!options?.ws) {
    throw new Error('Browser connections require options.ws with a WebSocket URL and key')
  }

  const live = new KeepLiveWS(roomId, options.ws)

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
