import type { GUARD_BUY as DataType } from 'tiny-bilibili-ws'
import type { Message, User } from '../types/app'
import type { GuardLevel } from '../types/const'

export interface GuardBuyMsg {
  /** 等级过期时间 */
  end_time: number
  /** 礼物id */
  gift_id: number
  /** 礼物名称 */
  gift_name: string
  /** 大航海信息 */
  guard_level: GuardLevel
  /** 价格，RMB */
  price: number
  /** 等级生效时间 */
  start_time: number
  user: User
}

const parser = (data: DataType): GuardBuyMsg => {
  const rawData = data.data
  return {
    end_time: rawData.end_time,
    gift_id: rawData.gift_id,
    gift_name: rawData.gift_name,
    guard_level: rawData.guard_level,
    price: rawData.price,
    start_time: rawData.start_time,
    user: {
      uid: rawData.uid,
      uname: rawData.username,
    },
  }
}

export const GUARD_BUY = {
  eventName: 'GUARD_BUY' as const,
  handlerName: 'onGuardBuy' as const,
  parser,
}

export type Handler = {
  /** 舰长上舰消息 */
  onGuardBuy: (msg: Message<GuardBuyMsg>) => void
}
