import type { SuperChatMsg } from "../app";

export default (data: any): SuperChatMsg => {
  const { uid, user_info, medal_info, message, price, time, background_price_color } = data.data
  return {
    user: {
      uid,
      uname: user_info.uname,
      badge: medal_info ? {
        active: medal_info.is_lighted === 1,
        name: medal_info.medal_name,
        level: medal_info.medal_level,
        color: medal_info.medal_color,
        anchor: {
          uid: medal_info.target_id,
          uname: medal_info.anchor_uname,
          room_id: medal_info.anchor_roomid,
        },
      } : undefined,
      identity: {
        rank: 0,
        guard_level: user_info.guard_level || 0,
        room_admin: user_info.manager === 1,
      }
    },
    content: message,
    content_color: background_price_color,
    price,
    time,
  }
}