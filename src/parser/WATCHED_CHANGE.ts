import type { Message } from '../types/app'

export interface WatchedChangeMsg {
  /** 累计入场人数·*/
  num: number
  /** 累计入场人数，格式化输出·*/
  text_small: string
}

const parser = (data: any): WatchedChangeMsg => {
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
  onWatchedChange: (data: Message<WatchedChangeMsg>) => void
}
