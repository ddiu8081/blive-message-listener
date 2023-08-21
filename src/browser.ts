import { KeepLiveWS } from 'tiny-bilibili-ws/browser'
import { listenAll, type MsgHandler } from './listener'
import type { MessageListener } from '.'
import type { WSOptions } from 'tiny-bilibili-ws'

interface MessageListenerWSOptions {
  /**
   * tiny-bilibili-ws 连接选项
   *
   * @see https://github.com/starknt/tiny-bilibili-ws
   */
  ws?: WSOptions
}

export const startListen = (roomId: number, handler: MsgHandler, options?: MessageListenerWSOptions) => {
  const live = new KeepLiveWS(roomId, options?.ws)

  listenAll(live, roomId, handler)

  const listenerInstance: MessageListener = {
    roomId: live.roomId,
    close: () => live.close(),
    getAttention: () => live.getOnline(),
  }

  return listenerInstance
}
