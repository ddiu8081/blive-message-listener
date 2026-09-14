import { intToColorHex } from '../utils/color'
import type { Message, User } from '../types/app'
import { decode as decodeSendGiftV2 } from '../protobuf/SEND_GIFT_V2.proto'

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
  /** 送礼指向主播信息，多人直播间可指定要送给的主播，单人直播间为空 */
  send_master?: {
    uid: number
    uname: string
    room_id: number
  }
  /** 礼物连击 */
  combo?: {
    /** 连击id */
    batch_id: string
    /** 当前连击数（礼物总数） */
    combo_num: number
    /** 连击礼物总价格，除以1000为RMB */
    total_price: number
  }
}

const parser = (data: any): GiftMsg => {
  const rawData = data.data
  return {
    user: {
      uid: rawData.uid,
      uname: rawData.uname,
      face: rawData.face,
      badge: rawData.medal_info?.medal_level ? {
        active: rawData.medal_info.is_lighted === 1,
        name: rawData.medal_info.medal_name,
        level: rawData.medal_info.medal_level,
        color: intToColorHex(rawData.medal_info.medal_color),
        gradient: [
          intToColorHex(rawData.medal_info.medal_color_start),
          intToColorHex(rawData.medal_info.medal_color_start),
          intToColorHex(rawData.medal_info.medal_color_end),
        ],
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
    send_master: rawData.send_master?.uid ? {
      uid: rawData.send_master.uid,
      uname: rawData.send_master.uname,
      room_id: rawData.send_master.room_id,
    } : undefined,
    // 礼物连击：
    // data.combo_send 仅首次连击不为空；data.batch_combo_send 速度过快时可能为空；data.batch_combo_id 常驻存在
    combo: rawData.batch_combo_id ? {
      batch_id: rawData.batch_combo_id,
      combo_num: rawData.super_batch_gift_num,
      total_price: rawData.combo_total_coin,
    } : undefined,
  }
}

export const SEND_GIFT = {
  parser,
  eventName: 'SEND_GIFT' as const,
  handlerName: 'onGift' as const,
}

export const SEND_GIFT_V2 = {
  parser: (data: any): GiftMsg[] => {
    const pb = data?.data?.pb
    if (pb === undefined || pb === null || pb === '') return []
    const decoded = decodeSendGiftV2(pb)
    return decoded.gift_list.map(gift => parser({
      data: {
        uid: decoded.uid,
        uname: decoded.uname,
        face: decoded.face,
        guard_level: decoded.guard_level,
        giftId: gift.gift_id,
        giftName: gift.gift_name,
        coin_type: gift.coin_type,
        price: gift.price,
        num: gift.num,
        // rnd is not a confirmed batch_combo_id. Do not invent combo totals,
        // send_master, or badge colors/activation from the incomplete schema.
      },
    }))
  },
  eventName: 'SEND_GIFT_V2' as const,
  handlerName: 'onGift' as const,
}

export type Handler = {
  /** 收到礼物 */
  onGift: (msg: Message<GiftMsg>) => void
}
