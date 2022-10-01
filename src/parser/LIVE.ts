import type { Message } from '../types/app'

export interface LiveStartMsg {
  /** 开播平台 */
  live_platform: string
  /** 房间号 */
  room_id: number
}

const parser = (data: any): LiveStartMsg => {
  return {
    live_platform: data.live_platform,
    room_id: data.roomid,
  }
}

export const LIVE = {
  parser,
  eventName: 'LIVE' as const,
  handlerName: 'onLiveStart' as const,
}

export type Handler = {
  /** 直播开始消息 */
  onLiveStart: (msg: Message<LiveStartMsg>) => void
}