import type { PREPARING as DataType } from 'tiny-bilibili-ws'
import type { Message } from '../types/app'

export interface LiveEndMsg {
  /** 房间号 */
  room_id: number
}

const parser = (data: DataType): LiveEndMsg => ({
  room_id: Number.parseInt(data.roomid, 10),
})

export const PREPARING = {
  eventName: 'PREPARING' as const,
  handlerName: 'onLiveEnd' as const,
  parser,
}

export type Handler = {
  /** 直播结束消息 */
  onLiveEnd: (msg: Message<LiveEndMsg>) => void
}
