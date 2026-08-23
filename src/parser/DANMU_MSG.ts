import type { DANMU_MSG as DataType } from 'tiny-bilibili-ws'
import type { Message, User } from '../types/app'
import { intToColorHex } from '../utils/color'

const IN_MESSAGE_EMOTICON_PATTERN = /\[.*?\]/

export interface DanmuMsg {
  /** 弹幕内容 */
  content: string
  /** 弹幕颜色 */
  content_color: string
  /** 表情弹幕内容 */
  emoticon?: {
    id: string
    height: number
    width: number
    url: string
  }
  /** 弹幕内小表情映射，key为表情文字，如"[妙]" */
  in_message_emoticon?: Record<
    string,
    {
      id: string
      emoticon_id: number
      height: number
      width: number
      url: string
      description: string
    }
  >
  /** 是否为天选抽奖弹幕 */
  lottery: boolean
  /** 发送时间，毫秒时间戳 */
  timestamp: number
  /** 弹幕类型：1 2 3：普通弹幕；4：底部弹幕；5：顶部弹幕 */
  type: number
  user: User
}

type InMessageEmoticon = NonNullable<DanmuMsg['in_message_emoticon']>

const parser = (data: DataType, roomId: number): DanmuMsg | null => {
  const rawData = data.info
  if (!rawData) {
    return null
  }
  const content = rawData[1]
  const shouldParseInMessageEmoticon = IN_MESSAGE_EMOTICON_PATTERN.test(content)
  let inMessageEmoticon: InMessageEmoticon | undefined
  if (shouldParseInMessageEmoticon) {
    const messageExtraInfo = JSON.parse(rawData[0][15].extra)
    const emoctionDict: InMessageEmoticon = {}
    if (messageExtraInfo.emots) {
      inMessageEmoticon = Object.keys(messageExtraInfo.emots).reduce((acc, key) => {
        const emoticon = messageExtraInfo.emots[key]
        acc[key] = {
          description: emoticon.descript,
          emoticon_id: emoticon.emoticon_id,
          height: emoticon.height,
          id: emoticon.emoticon_unique,
          url: emoticon.url,
          width: emoticon.width,
        }
        return acc
      }, emoctionDict)
    }
  }
  return {
    content,
    content_color: intToColorHex(rawData[0][3]),
    emoticon: (rawData[0][13] as any)?.emoticon_unique
      ? {
          height: (rawData[0][13] as any).height,
          id: (rawData[0][13] as any).emoticon_unique,
          url: (rawData[0][13] as any).url,
          width: (rawData[0][13] as any).width,
        }
      : undefined,
    in_message_emoticon: inMessageEmoticon,
    lottery: rawData[0][9] !== 0,
    timestamp: rawData[0][4],
    type: rawData[0][1],
    user: {
      badge: rawData[3]?.length
        ? {
            active: rawData[3][7] !== 12_632_256,
            anchor: {
              is_same_room: rawData[3][3] === roomId,
              room_id: rawData[3][3],
              uid: rawData[3][12],
              uname: rawData[3][2],
            },
            color: intToColorHex(rawData[3][4]),
            gradient: [
              intToColorHex(rawData[3][7]),
              intToColorHex(rawData[3][8]),
              intToColorHex(rawData[3][9]),
            ],
            level: rawData[3][0],
            name: rawData[3][1],
          }
        : undefined,
      identity: {
        guard_level: rawData[7],
        rank: rawData[4][4] as any,
        room_admin: rawData[2][2] === 1,
      },
      uid: rawData[2][0],
      uname: rawData[2][1],
    },
  }
}

export const DANMU_MSG = {
  eventName: 'DANMU_MSG' as const,
  handlerName: 'onIncomeDanmu' as const,
  parser,
}

export type Handler = {
  /** 收到普通弹幕消息 */
  onIncomeDanmu: (msg: Message<DanmuMsg>) => void
}
