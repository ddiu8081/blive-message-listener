import type { User } from "../app";

export interface GuardBuyMsg {
  user: User
  gift_id: number
  gift_name: string
  guard_level: number
  price: number
  start_time: number
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
  eventName: 'GUARD_BUY',
  handlerName: 'onGuardBuy',
  handlerNameRaw: 'onGuardBuyRaw',
}