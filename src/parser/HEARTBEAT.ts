import type { Message } from '../types/app'

export interface AttentionChangeMsg {
  /** 直播间热度 */
  attention: number
}

const parser = (data: number): AttentionChangeMsg => ({
  attention: data,
})

export const HEARTBEAT = {
  eventName: 'heartbeat' as const,
  handlerName: 'onAttentionChange' as const,
  parser,
}

export type Handler = {
  /** 直播间热度变化 */
  onAttentionChange: (msg: Message<AttentionChangeMsg>) => void
}
