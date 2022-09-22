import { KeepLiveTCP } from 'bilibili-live-ws'

import { listenAll, type MsgHandler } from './listener'
import { Message } from './app'

export const startListen = (roomId: number, handler: MsgHandler) => {
  const live = new KeepLiveTCP(roomId)

  listenAll(live, handler)
}

export type { MsgHandler, Message }
