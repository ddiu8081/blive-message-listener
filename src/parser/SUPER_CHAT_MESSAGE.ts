import type { SUPER_CHAT_MESSAGE as DataType } from 'tiny-bilibili-ws'
import type { Message, User } from '../types/app'

export interface SuperChatMsg {
  /** 弹幕内容 */
  content: string
  /** 弹幕颜色 */
  content_color: string
  /** 消息id */
  id: number
  /** 价格，RMB */
  price: number
  /** 持续时间，秒 */
  time: number
  /** 发送用户 */
  user: User
}

const parser = (data: DataType, roomId: number): SuperChatMsg => {
  const rawData = data.data
  const { medal_info, user_info } = data.data
  return {
    content: rawData.message,
    content_color: rawData.background_price_color,
    id: rawData.id,
    price: rawData.price,
    time: rawData.time,
    user: {
      badge: medal_info
        ? {
            active: medal_info.is_lighted === 1,
            anchor: {
              is_same_room: medal_info.anchor_roomid === roomId,
              room_id: medal_info.anchor_roomid,
              uid: medal_info.target_id,
              uname: medal_info.anchor_uname,
            },
            color: medal_info.medal_color,
            level: medal_info.medal_level,
            name: medal_info.medal_name,
          }
        : undefined,
      identity: {
        guard_level: user_info.guard_level || 0,
        rank: 0,
        room_admin: user_info.manager === 1,
      },
      uid: rawData.uid,
      uname: rawData.user_info.uname,
    },
  }
}

export const SUPER_CHAT_MESSAGE = {
  eventName: 'SUPER_CHAT_MESSAGE' as const,
  handlerName: 'onIncomeSuperChat' as const,
  parser,
}

export type Handler = {
  /** 收到醒目留言 */
  onIncomeSuperChat: (msg: Message<SuperChatMsg>) => void
}
