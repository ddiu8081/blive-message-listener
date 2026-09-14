import protobuf from 'protobufjs'
import { validateWire } from './validate'

// Based on the fuller protocol posted by xfgryujk in PR #86 comments:
// https://github.com/xfgryujk/blivedm/pull/86
// The merged Python model aliases field 4/12 as gift_type/rnd; the protocol
// names are demarcation/batch_combo_id. Unmodeled user/effect messages are skipped.
const root = protobuf.Root.fromJSON({
  nested: {
    SendGiftV2: {
      fields: {
        uid: { type: 'int64', id: 1 },
        uname: { type: 'string', id: 2 },
        face: { type: 'string', id: 3 },
        name_color: { type: 'string', id: 4 },
        guard_level: { type: 'int64', id: 5 },
        svga_block: { type: 'int64', id: 6 },
        send_master: { type: 'SendMaster', id: 7 },
        medal_info: { type: 'MedalInfo', id: 8 },
        blind_gift: { type: 'BlindGift', id: 9 },
        gift_list: { rule: 'repeated', type: 'GiftItem', id: 10 },
        switch: { type: 'bool', id: 11 },
        test: { type: 'int64', id: 12 },
        wealth_info: { type: 'WealthInfo', id: 13 },
      },
    },
    SendMaster: {
      fields: {
        uid: { type: 'int64', id: 1 },
        uname: { type: 'string', id: 2 },
      },
    },
    MedalInfo: {
      fields: {
        target_id: { type: 'int64', id: 1 },
        special: { type: 'string', id: 2 },
        anchor_uname: { type: 'string', id: 3 },
        anchor_roomid: { type: 'int64', id: 4 },
        medal_level: { type: 'int64', id: 5 },
        medal_name: { type: 'string', id: 6 },
        medal_color: { type: 'int64', id: 7 },
        medal_color_start: { type: 'int64', id: 8 },
        medal_color_end: { type: 'int64', id: 9 },
        medal_color_border: { type: 'int64', id: 10 },
        is_lighted: { type: 'int64', id: 11 },
        guard_level: { type: 'int64', id: 12 },
      },
    },
    BlindGift: {
      fields: {
        blind_gift_config_id: { type: 'int64', id: 1 },
        original_gift_id: { type: 'int64', id: 2 },
        original_gift_name: { type: 'string', id: 3 },
        from: { type: 'int64', id: 4 },
        gift_action: { type: 'string', id: 5 },
        original_gift_price: { type: 'int64', id: 6 },
        gift_tip_price: { type: 'int64', id: 7 },
      },
    },
    GiftItem: {
      fields: {
        gift_id: { type: 'int64', id: 1 },
        gift_name: { type: 'string', id: 2 },
        num: { type: 'int64', id: 3 },
        demarcation: { type: 'int64', id: 4 },
        price: { type: 'int64', id: 5 },
        discount_price: { type: 'int64', id: 6 },
        total_coin: { type: 'int64', id: 7 },
        coin_type: { type: 'string', id: 8 },
        tid: { type: 'string', id: 9 },
        timestamp: { type: 'int64', id: 10 },
        super_batch_gift_num: { type: 'int64', id: 11 },
        batch_combo_id: { type: 'string', id: 12 },
        combo_resources_id: { type: 'int64', id: 13 },
        combo_total_coin: { type: 'int64', id: 14 },
        combo_stay_time: { type: 'int64', id: 15 },
        magnification: { type: 'float', id: 16 },
        show_batch_combo_send: { type: 'bool', id: 17 },
        action: { type: 'string', id: 18 },
        effect_block: { type: 'int64', id: 19 },
        is_special_batch: { type: 'int64', id: 20 },
        float_sc_resource_id: { type: 'int64', id: 21 },
        tag_image: { type: 'string', id: 22 },
        crit_prob: { type: 'int64', id: 23 },
        rcost: { type: 'int64', id: 24 },
        test: { type: 'int64', id: 25 },
        face_effect_type: { type: 'int64', id: 26 },
        face_effect_id: { type: 'int64', id: 27 },
        is_naming: { type: 'bool', id: 28 },
        receive_user_info: { type: 'ReceiveUserInfo', id: 29 },
        is_join_receiver: { type: 'bool', id: 30 },
        bag_gift: { type: 'BagGiftInfo', id: 31 },
        gift_tag: { rule: 'repeated', type: 'int64', id: 32 },
        gift_tip_price: { type: 'int64', id: 36 },
      },
    },
    WealthInfo: {
      fields: {
        level: { type: 'int64', id: 1 },
      },
    },
    ReceiveUserInfo: {
      fields: {
        uname: { type: 'string', id: 1 },
        uid: { type: 'int64', id: 2 },
      },
    },
    BagGiftInfo: {
      fields: {
        show_price: { type: 'int32', id: 1 },
        price_for_show: { type: 'int64', id: 2 },
      },
    },
  },
})

export interface SendGiftV2 {
  uid: number
  uname: string
  face: string
  name_color: string
  guard_level: number
  svga_block: number
  send_master: SendMaster | null
  medal_info: MedalInfo | null
  blind_gift: BlindGift | null
  gift_list: GiftItem[]
  switch: boolean
  test: number
  wealth_info: WealthInfo | null
}

interface SendMaster {
  uid: number
  uname: string
}

interface MedalInfo {
  target_id: number
  special: string
  anchor_uname: string
  anchor_roomid: number
  medal_level: number
  medal_name: string
  medal_color: number
  medal_color_start: number
  medal_color_end: number
  medal_color_border: number
  is_lighted: number
  guard_level: number
}

interface BlindGift {
  blind_gift_config_id: number
  original_gift_id: number
  original_gift_name: string
  from: number
  gift_action: string
  original_gift_price: number
  gift_tip_price: number
}

interface GiftItem {
  gift_id: number
  gift_name: string
  num: number
  demarcation: number
  price: number
  discount_price: number
  total_coin: number
  coin_type: 'silver' | 'gold'
  tid: string
  timestamp: number
  super_batch_gift_num: number
  batch_combo_id: string
  combo_resources_id: number
  combo_total_coin: number
  combo_stay_time: number
  magnification: number
  show_batch_combo_send: boolean
  action: string
  effect_block: number
  is_special_batch: number
  float_sc_resource_id: number
  tag_image: string
  crit_prob: number
  rcost: number
  test: number
  face_effect_type: number
  face_effect_id: number
  is_naming: boolean
  receive_user_info: ReceiveUserInfo | null
  is_join_receiver: boolean
  bag_gift: BagGiftInfo | null
  gift_tag: number[]
  gift_tip_price: number
}

interface WealthInfo {
  level: number
}

interface ReceiveUserInfo {
  uname: string
  uid: number
}

interface BagGiftInfo {
  show_price: number
  price_for_show: number
}

const messageType = root.lookupType('SendGiftV2')
root.resolveAll()

// Our public API uses numbers. Reject unsafe integer conversion instead of
// silently corrupting identifiers, amounts, counts or nested medal metadata.
const checkIntegers = (value: unknown, path = 'SEND_GIFT_V2'): void => {
  if (!value || typeof value !== 'object') return
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'number' && key !== 'magnification' && !Number.isSafeInteger(item)) {
      throw new RangeError(`${path}.${key} exceeds safe integer range`)
    }
    checkIntegers(item, `${path}.${key}`)
  }
}

export const decode = (base64Data: string): SendGiftV2 => {
  if (typeof base64Data !== 'string') throw new TypeError('SEND_GIFT_V2 pb must be a Base64 string')
  const bytes = Uint8Array.from(atob(base64Data), char => char.charCodeAt(0))
  validateWire(bytes, messageType)
  const data = messageType.toObject(messageType.decode(bytes), {
    longs: Number,
    defaults: true,
    arrays: true,
  }) as SendGiftV2
  checkIntegers(data)
  for (const gift of data.gift_list) {
    if (gift.coin_type !== 'gold' && gift.coin_type !== 'silver') {
      throw new Error(`Unsupported SEND_GIFT_V2 coin_type: ${gift.coin_type}`)
    }
  }
  return data
}
