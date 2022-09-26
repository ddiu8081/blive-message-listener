import { KeepLiveTCP } from 'bilibili-live-ws'

import { listenAll, type MsgHandler } from './listener'

export const startListen = (roomId: number, handler: MsgHandler) => {
  const live = new KeepLiveTCP(roomId)

  listenAll(live, roomId, handler)

  return live
}

export type { MsgHandler }
export type { Message, GuardLevel, User } from './types/app'
export * from './types/message'
