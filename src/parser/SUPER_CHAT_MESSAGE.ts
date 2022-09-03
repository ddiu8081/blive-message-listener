import type { SuperChatMsg } from "../app";

export default (data): SuperChatMsg => {
  const { uid, user_info, medal_info, message, price, time } = data.data
  return {
    user: {
      uid,
      uname: user_info.uname,
      badge: {
        name: medal_info.medal_name,
        level: medal_info.medal_level,
      },
    },
    content: message,
    price,
    time,
  }
}