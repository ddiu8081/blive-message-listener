import type { LIVE as DataType } from 'tiny-bilibili-ws'
import type { Message } from '../types/app'

export interface LiveStartMsg {
  /** 开播平台 */
  live_platform: string
  /** 房间号 */
  room_id: number
}

const parser = (data: DataType): LiveStartMsg => ({
  live_platform: data.live_platform,
  room_id: data.roomid,
})

export const LIVE = {
  eventName: 'LIVE' as const,
  handlerName: 'onLiveStart' as const,
  parser,
}

export type Handler = {
  /** 直播开始消息 */
  onLiveStart: (msg: Message<LiveStartMsg>) => void
}
