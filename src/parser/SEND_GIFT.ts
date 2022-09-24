import { intToColorHex } from '../utils/color'
import type { Message, User } from '../types/app'

export interface GiftMsg {
  user: User
  /** 礼物id */
  gift_id: number
  /** 礼物名称 */
  gift_name: string
  /** 礼物价格类型 */
  coin_type: 'silver' | 'gold'
  /** 礼物价格，除以1000为RMB */
  price: number
  /** 礼物数量 */
  amount: number
}

const parser = (data: any): GiftMsg => {
  const rawData = data.data
  return {
    user: {
      uid: rawData.uid,
      uname: rawData.uname,
      face: rawData.face,
      badge: rawData.medal_info ? {
        active: rawData.medal_info.is_lighted === 1,
        name: rawData.medal_info.medal_name,
        level: rawData.medal_info.medal_level,
        color: intToColorHex(rawData.medal_info.medal_color_start),
        anchor: {
          uid: rawData.medal_info.target_id,
          uname: rawData.medal_info.anchor_uname, // maybe ''
          room_id: rawData.medal_info.anchor_roomid, // maybe 0
        },
      } : undefined,
      identity: {
        rank: 0,
        guard_level: rawData.guard_level,
        room_admin: false,
      }
    },
    gift_id: rawData.giftId,
    gift_name: rawData.giftName,
    coin_type: rawData.coin_type,
    price: rawData.price,
    amount: rawData.num,
  }
}

export const SEND_GIFT = {
  parser,
  eventName: 'SEND_GIFT' as const,
  handlerName: 'onGift' as const,
}

export type Handler = {
  onGift: (msg: Message<GiftMsg>) => void
}
