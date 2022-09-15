import { intToColorHex } from '../utils/color'
import type { GiftMsg } from "../app";

export default (data: any): GiftMsg => {
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
    price: rawData.price,
    amount: rawData.num,
  }
}