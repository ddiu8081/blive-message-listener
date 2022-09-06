import type { SuperChatMsg } from "../app";

export default (data: any): SuperChatMsg => {
  const { uid, user_info, medal_info, message, price, time } = data.data
  return {
    user: {
      uid,
      uname: user_info.uname,
      badge: {
        name: medal_info.medal_name,
        level: medal_info.medal_level,
        color: medal_info.medal_color,
        anchor: {
          uid: medal_info.target_id,
          uname: medal_info.anchor_uname,
          room_id: medal_info.anchor_roomid,
        },
      },
    },
    content: message,
    price,
    time,
  }
}