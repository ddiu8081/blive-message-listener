import type { Message, User } from '../types/app'

export interface SuperChatMsg {
  user: User
  /** 弹幕内容·*/
  content: string
  /** 弹幕颜色·*/
  content_color: string
  /** 价格·*/
  price: number
  /** 持续时间·*/
  time: number
}

const parser = (data: any): SuperChatMsg => {
  const rawData = data.data
  const { medal_info, user_info } = data.data
  return {
    user: {
      uid: rawData.uid,
      uname: rawData.user_info.uname,
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
    content: rawData.message,
    content_color: rawData.background_price_color,
    price: rawData.price,
    time: rawData.time,
  }
}

export const SUPER_CHAT_MESSAGE = {
  parser,
  eventName: 'SUPER_CHAT_MESSAGE' as const,
  handlerName: 'onIncomeSuperChat' as const,
}

export type Handler = {
  onIncomeSuperChat: (msg: Message<SuperChatMsg>) => void
}
