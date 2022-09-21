import type { Danmu, User, GuardLevel } from '../app'

export interface GuardBuyMsg {
  user: User
  /** 礼物id·*/
  gift_id: number
  /** 礼物名称·*/
  gift_name: string
  /** 大航海信息 */
  guard_level: GuardLevel
  /** 价格·*/
  price: number
  /** 等级生效时间·*/
  start_time: number
  /** 等级过期时间·*/
  end_time: number
}

const parser = (data: any): GuardBuyMsg => {
  const rawData = data.data
  return {
    user: {
      uid: rawData.uid,
      uname: rawData.username,
    },
    gift_id: rawData.gift_id,
    gift_name: rawData.gift_name,
    guard_level: rawData.guard_level,
    price: rawData.price,
    start_time: rawData.start_time,
    end_time: rawData.end_time,
  }
}

export const GUARD_BUY = {
  parser,
  eventName: 'GUARD_BUY' as const,
  handlerName: 'onGuardBuy' as const,
}

export type Handler = {
  onGuardBuy: (data: Danmu<GuardBuyMsg>) => void
}