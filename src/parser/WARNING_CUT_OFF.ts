import type { Message } from '../types/app'

export interface RoomWarnMsg {
  /** 处理类型 */
  type: 'warning' | 'cut'
  /** 处理原因 */
  msg: string
}

const parser = (data: any, roomId: number): RoomWarnMsg => {
  const msgType = data.cmd
  const rawData = data

  return {
    type: msgType === 'WARNING' ? 'warning' : 'cut',
    msg: rawData.msg,
  }
}

export const WARNING = {
  parser,
  eventName: 'WARNING' as const,
  handlerName: 'onRoomWarn' as const,
}

export const CUT_OFF = {
  parser,
  eventName: 'CUT_OFF' as const,
  handlerName: 'onRoomWarn' as const,
}

export type Handler = {
  /** 房间被超管警告、切断 */
  onRoomWarn: (msg: Message<RoomWarnMsg>) => void
}
