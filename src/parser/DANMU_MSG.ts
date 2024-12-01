import { intToColorHex } from '../utils/color'
import type { Message, User } from '../types/app'
import type { DANMU_MSG as DataType } from 'tiny-bilibili-ws'

export interface DanmuMsg {
  user: User
  /** 弹幕内容 */
  content: string
  /** 弹幕类型：1 2 3：普通弹幕；4：底部弹幕；5：顶部弹幕 */
  type: number
  /** 弹幕颜色 */
  content_color: string
  /** 发送时间，毫秒时间戳 */
  timestamp: number
  /** 是否为天选抽奖弹幕 */
  lottery: boolean
  /** 表情弹幕内容 */
  emoticon?: {
    id: string
    height: number
    width: number
    url: string
  }
  /** 弹幕内小表情映射，key为表情文字，如"[妙]" */
  in_message_emoticon?: Record<string, {
    id: string
    emoticon_id: number
    height: number
    width: number
    url: string
    description: string
  }>
}

const parser = (data: DataType, roomId: number): DanmuMsg => {
  const rawData = data.info
  const content = rawData[1]
  const shouldParseInMessageEmoticon = /\[.*?\]/.test(content)
  let inMessageEmoticon
  if (shouldParseInMessageEmoticon) {
    const messageExtraInfo = JSON.parse(rawData[0][15].extra)
    const emoctionDict: Record<string, {
      id: string
      emoticon_id: number
      height: number
      width: number
      url: string
      description: string
    }> = {}
    if (messageExtraInfo.emots) {
      inMessageEmoticon = Object.keys(messageExtraInfo.emots).reduce((acc, key) => {
        const emoticon = messageExtraInfo.emots[key]
        acc[key] = {
          id: emoticon.emoticon_unique,
          emoticon_id: emoticon.emoticon_id,
          height: emoticon.height,
          width: emoticon.width,
          url: emoticon.url,
          description: emoticon.descript,
        }
        return acc
      }, emoctionDict)
    }
  }
  return {
    user: {
      uid: rawData[2][0],
      uname: rawData[2][1],
      badge: rawData[3].length ? {
        active: rawData[3][7] !== 12632256,
        name: rawData[3][1],
        level: rawData[3][0],
        color: intToColorHex(rawData[3][4]),
        gradient: [
          intToColorHex(rawData[3][7]), 
          intToColorHex(rawData[3][8]), 
          intToColorHex(rawData[3][9]),
        ],
        anchor: {
          uid: rawData[3][12],
          uname: rawData[3][2],
          room_id: rawData[3][3],
          is_same_room: rawData[3][3] === roomId,
        },
      } : undefined,
      identity: {
        rank: rawData[4][4] as any,
        guard_level: rawData[7],
        room_admin: rawData[2][2] === 1,
      },
    },
    content,
    type: rawData[0][1],
    content_color: intToColorHex(rawData[0][3]),
    timestamp: rawData[0][4],
    lottery: rawData[0][9] !== 0,
    emoticon: (rawData[0][13] as any)?.emoticon_unique ? {
      id: (rawData[0][13] as any).emoticon_unique,
      height: (rawData[0][13] as any).height,
      width: (rawData[0][13] as any).width,
      url: (rawData[0][13] as any).url,
    } : undefined,
    in_message_emoticon: inMessageEmoticon,
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
