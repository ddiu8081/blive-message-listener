import { intToColorHex } from '../utils/color'
import type { Message, User } from '../types/app'

export interface NewComerMsg {
  user: User
  /** 入场时间，毫秒时间戳 */
  timestamp: number
}

const parserNormal = (data: any, roomId: number): NewComerMsg => {
  const rawData = data.data
  return {
    user: {
      uid: rawData.uid,
      uname: rawData.uname,
      face: rawData.face,
      badge: rawData.fans_medal?.target_id ? {
        active: rawData.fans_medal?.is_lighted,
        name: rawData.fans_medal?.medal_name,
        level: rawData.fans_medal?.medal_level,
        color: intToColorHex(rawData.fans_medal?.medal_color_start),
        anchor: {
          uid: rawData.fans_medal?.target_id,
          uname: '',
          room_id: rawData.fans_medal?.anchor_roomid,
          is_same_room: rawData.fans_medal?.anchor_roomid === roomId,
        }
      } : undefined,
      identity: {
        rank: 0,
        guard_level: rawData.privilege_type,
        room_admin: false,
      }
    },
    timestamp: Math.ceil(rawData.trigger_time / 1000000),
  }
}

const parserGuard = (data: any, roomId: number): NewComerMsg => {
  const rawData = data.data
  const uname = /<%(.*)%>/.exec(rawData.copy_writing)?.[1] || ''
  return {
    user: {
      uid: rawData.uid,
      uname: uname, // 超长会有省略号
      identity: {
        rank: 0,
        guard_level: rawData.privilege_type,
        room_admin: false,
      }
    },
    timestamp: Math.ceil(rawData.trigger_time / 1000000),
  }
}

const parser = (data: any, roomId: number): NewComerMsg => {
  const msgType = data.cmd
  if (msgType === 'ENTRY_EFFECT') {
    return parserGuard(data, roomId)
  } else {
    // INTERACT_WORD
    return parserNormal(data, roomId)
  }
}

export const INTERACT_WORD = {
  parser,
  eventName: 'INTERACT_WORD' as const,
  handlerName: 'onNewComer' as const,
}

export const ENTRY_EFFECT = {
  parser,
  eventName: 'ENTRY_EFFECT' as const,
  handlerName: 'onNewComer' as const,
}

export type Handler = {
  onNewComer: (msg: Message<NewComerMsg>) => void
}