import type { Message } from '../types/app'
import type { WATCHED_CHANGE as DataType } from 'tiny-bilibili-ws'

export interface WatchedChangeMsg {
  /** 累计入场人数 */
  num: number
  /** 累计入场人数，格式化输出 */
  text_small: string
}

const parser = (data: DataType): WatchedChangeMsg => {
  const rawData = data.data
  return {
    num: rawData.num,
    text_small: rawData.text_small,
  }
}

export const WATCHED_CHANGE = {
  parser,
  eventName: 'WATCHED_CHANGE' as const,
  handlerName: 'onWatchedChange' as const,
}

export type Handler = {
  /** 累计看过人数变化 */
  onWatchedChange: (msg: Message<WatchedChangeMsg>) => void
}
