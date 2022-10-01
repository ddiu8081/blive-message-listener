import type { Message } from '../types/app'

export interface LiveEndMsg {
  /** 房间号 */
  room_id: number
}

const parser = (data: any): LiveEndMsg => {
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