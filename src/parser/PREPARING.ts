import type { Message } from '../types/app'
import type { PREPARING as DataType } from 'tiny-bilibili-ws'


export interface LiveEndMsg {
  /** 房间号 */
  room_id: number
}

const parser = (data: DataType): LiveEndMsg => {
  return {
    room_id: parseInt(data.roomid),
  }
}

export const PREPARING = {
  parser,
  eventName: 'PREPARING' as const,
  handlerName: 'onLiveEnd' as const,
}

export type Handler = {
  /** 直播结束消息 */
  onLiveEnd: (msg: Message<LiveEndMsg>) => void
}
