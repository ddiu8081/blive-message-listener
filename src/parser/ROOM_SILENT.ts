import type {
  ROOM_SILENT_OFF as ROOM_SILENT_OFF_TYPE,
  ROOM_SILENT_ON as ROOM_SILENT_ON_TYPE,
} from 'tiny-bilibili-ws'
import type { Message } from '../types/app'

export interface RoomSilentMsg {
  /** 禁言等级 */
  level: number
  /** 禁言结束时间，秒级时间戳，-1 为无限 */
  second: number
  /** 禁言类型（按用户等级、勋章等级、全员、关闭） */
  type: 'level' | 'medal' | 'member' | 'off'
}

const parser = (
  data: ROOM_SILENT_OFF_TYPE | ROOM_SILENT_ON_TYPE,
  roomId: number
): RoomSilentMsg => {
  const msgType = data.cmd
  const rawData = data.data

  return {
    level: rawData.level,
    second: rawData.second,
    type:
      msgType === 'ROOM_SILENT_OFF'
        ? 'off'
        : (rawData.type as 'level' | 'medal' | 'member' | 'off'),
  }
}

export const ROOM_SILENT_ON = {
  eventName: 'ROOM_SILENT_ON' as const,
  handlerName: 'onRoomSilent' as const,
  parser,
}

export const ROOM_SILENT_OFF = {
  eventName: 'ROOM_SILENT_OFF' as const,
  handlerName: 'onRoomSilent' as const,
  parser,
}

export type Handler = {
  /** 房间开启、关闭全局禁言 */
  onRoomSilent: (msg: Message<RoomSilentMsg>) => void
}
