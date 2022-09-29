import { intToColorHex } from '../utils/color'
import type { Message, User } from '../types/app'

export interface DanmuMsg {
  user: User
  content: string
  /** 发送时间，毫秒时间戳 */
  timestamp: number
  /** 是否为天选抽奖弹幕 */
  lottery: boolean
  /** 弹幕表情 */
  emoticon?: {
    id: string
    height: number
    width: number
    url: string
  }
}

const parser = (data: any, roomId: number): DanmuMsg => {
  const rawData = data.info
  return {
    user: {
      uid: rawData[2][0],
      uname: rawData[2][1],
      badge: rawData[3].length ? {
        active: rawData[3][7] !== 12632256,
        name: rawData[3][1],
        level: rawData[3][0],
        color: intToColorHex(rawData[3][4]),
        anchor: {
          uid: rawData[3][12],
          uname: rawData[3][2],
          room_id: rawData[3][3],
          is_same_room: rawData[3][3] === roomId,
        },
      } : undefined,
      identity: {
        rank: rawData[4][4],
        guard_level: rawData[7],
        room_admin: rawData[2][2] === 1,
      },
    },
    content: rawData[1],
    timestamp: rawData[0][4],
    lottery: rawData[0][9] !== 0,
    emoticon: rawData[0][13]?.emoticon_unique ? {
      id: rawData[0][13].emoticon_unique,
      height: rawData[0][13].height,
      width: rawData[0][13].width,
      url: rawData[0][13].url,
    } : undefined,
  }
}

export const DANMU_MSG = {
  parser,
  eventName: 'DANMU_MSG' as const,
  handlerName: 'onIncomeDanmu' as const,
}

export type Handler = {
  /** 收到普通弹幕消息 */
  onIncomeDanmu: (msg: Message<DanmuMsg>) => void
}
