import type { Message, User } from '../types/app'
import type { SUPER_CHAT_MESSAGE as DataType } from 'tiny-bilibili-ws'

export interface SuperChatMsg {
  /** 消息id */
  id: number
  /** 发送用户 */
  user: User
  /** 弹幕内容 */
  content: string
  /** 弹幕颜色 */
  content_color: string
  /** 价格，RMB */
  price: number
  /** 持续时间，秒 */
  time: number
}

const parser = (data: DataType, roomId: number): SuperChatMsg => {
  const rawData = data.data
  const { medal_info, user_info } = data.data
  return {
    id: rawData.id,
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
          is_same_room: medal_info.anchor_roomid === roomId,
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
  /** 收到醒目留言 */
  onIncomeSuperChat: (msg: Message<SuperChatMsg>) => void
}
