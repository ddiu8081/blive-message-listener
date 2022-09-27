import { KeepLiveWS } from 'tiny-bilibili-ws/browser'
import type { MessageListener } from '.'

import { listenAll, type MsgHandler } from './listener'

export const startListen = (roomId: number, handler: MsgHandler) => {
  const live = new KeepLiveWS(roomId)

  listenAll(live, roomId, handler)

  const listenerInstance: MessageListener = {
    roomId: live.roomId,
    close: () => live.close(),
    getAttention: () => live.getOnline(),
  }

  return listenerInstance
}
