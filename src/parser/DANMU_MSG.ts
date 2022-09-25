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
  const content = data.info[1]
  const username = data.info[2][1]
  const badge: DanmuMsg['user']['badge'] = data.info[3].length ? {
    active: data.info[3][7] !== 12632256,
    name: data.info[3][1],
    level: data.info[3][0],
    color: intToColorHex(data.info[3][4]),
    anchor: {
      uid: data.info[3][12],
      uname: data.info[3][2],
      room_id: data.info[3][3],
      is_same_room: data.info[3][3] === roomId,
    },
  } : undefined
  return {
    user: {
      uid: data.info[2][0],
      uname: username,
      badge,
      identity: {
        rank: data.info[4][4],
        guard_level: data.info[7],
        room_admin: data.info[2][2] === 1,
      },
    },
    content,
    timestamp: data.info[0][4],
    lottery: data.info[0][9] !== 0,
    emoticon: data.info[0][13]?.emoticon_unique ? {
      id: data.info[0][13].emoticon_unique,
      height: data.info[0][13].height,
      width: data.info[0][13].width,
      url: data.info[0][13].url,
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
