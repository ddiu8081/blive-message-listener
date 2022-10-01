import type { Message } from '../types/app'

export interface RankCountChangeMsg {
  /** 高能用户人数 */
  count: number
}

const parser = (data: any): RankCountChangeMsg => {
  const rawData = data.data
  return {
    count: rawData.count,
  }
}

export const ONLINE_RANK_COUNT = {
  parser,
  eventName: 'ONLINE_RANK_COUNT' as const,
  handlerName: 'onRankCountChange' as const,
}

export type Handler = {
  /** 高能用户人数变化 */
  onRankCountChange: (msg: Message<RankCountChangeMsg>) => void
}