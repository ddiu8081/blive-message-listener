import type { Message } from '../types/app'

export interface RoomSilentMsg {
  /** 禁言类型（按用户等级、勋章等级、全员、关闭） */
  type: 'level' | 'medal' | 'member' | 'off'
  /** 禁言等级 */
  level: number
  /** 禁言结束时间，秒级时间戳，-1 为无限 */
  second: number
}

const parser = (data: any, roomId: number): RoomSilentMsg => {
  const msgType = data.cmd
  const rawData = data.data

  return {
    type: msgType === 'ROOM_SILENT_OFF' ? 'off' : rawData.type,
    level: rawData.level,
    second: rawData.second,
  }
}

export const ROOM_SILENT_ON = {
  parser,
  eventName: 'ROOM_SILENT_ON' as const,
  handlerName: 'onRoomSilent' as const,
}

export const ROOM_SILENT_OFF = {
  parser,
  eventName: 'ROOM_SILENT_OFF' as const,
  handlerName: 'onRoomSilent' as const,
}

export type Handler = {
  /** 房间开启、关闭全局禁言 */
  onRoomSilent: (msg: Message<RoomSilentMsg>) => void
}
