import type { Message } from '../types/app'

export interface LikedChangeMsg {
  /** 直播间点赞人数 */
  count: number
}

const parser = (data: any): LikedChangeMsg => {
  const rawData = data.data
  return {
    count: rawData.click_count,
  }
}

export const LIKE_INFO_V3_UPDATE = {
  parser,
  eventName: 'LIKE_INFO_V3_UPDATE' as const,
  handlerName: 'onLikedChange' as const,
}

export type Handler = {
  /** 累计点赞人数变化 */
  onLikedChange: (msg: Message<LikedChangeMsg>) => void
}