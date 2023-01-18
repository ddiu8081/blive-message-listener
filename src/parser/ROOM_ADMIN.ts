import type { Message } from '../types/app'

export interface RoomAdminSetMsg {
  /** 类型（设立、撤销） */
  type: 'set' | 'revoke'
  /** 用户uid */
  uid: number
}

const parser = (data: any, roomId: number): RoomAdminSetMsg => {
  const msgType = data.cmd
  const rawData = data

  return {
    type: msgType === 'room_admin_entrance' ? 'set' : 'revoke',
    uid: rawData.uid,
  }
}

export const room_admin_entrance = {
  parser,
  eventName: 'room_admin_entrance' as const,
  handlerName: 'onRoomAdminSet' as const,
}

export const ROOM_ADMIN_REVOKE = {
  parser,
  eventName: 'ROOM_ADMIN_REVOKE' as const,
  handlerName: 'onRoomAdminSet' as const,
}

export type Handler = {
  /** 房间设立、撤销房管 */
  onRoomAdminSet: (msg: Message<RoomAdminSetMsg>) => void
}
