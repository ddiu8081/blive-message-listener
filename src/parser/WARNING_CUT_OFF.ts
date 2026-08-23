import type { WARNING as DataType } from 'tiny-bilibili-ws'
import type { Message } from '../types/app'

export interface RoomWarnMsg {
  /** 处理原因 */
  msg: string
  /** 处理类型 */
  type: 'warning' | 'cut'
}

const parser = (data: DataType, roomId: number): RoomWarnMsg => {
  const msgType = data.cmd
  const rawData = data

  return {
    msg: rawData.msg,
    type: msgType === 'WARNING' ? 'warning' : 'cut',
  }
}

export const WARNING = {
  eventName: 'WARNING' as const,
  handlerName: 'onRoomWarn' as const,
  parser,
}

export const CUT_OFF = {
  eventName: 'CUT_OFF' as const,
  handlerName: 'onRoomWarn' as const,
  parser,
}

export type Handler = {
  /** 房间被超管警告、切断 */
  onRoomWarn: (msg: Message<RoomWarnMsg>) => void
}
