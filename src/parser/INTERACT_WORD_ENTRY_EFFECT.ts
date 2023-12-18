import { intToColorHex } from '../utils/color'
import type { Message, User } from '../types/app'
import type { INTERACT_WORD as DataType } from 'tiny-bilibili-ws'

type UserAction = 'enter' | 'follow' | 'share' | 'like' | 'unknown'

export interface UserActionMsg {
  user: User
  /** 事件类型 */
  action: UserAction
  /** 事件时间，毫秒时间戳 */
  timestamp: number
}

const parserNormal = (data: DataType & {  data: { face?: string } }, roomId: number): UserActionMsg => {
  const rawData = data.data
  let actionType: UserAction = 'unknown'
  if (rawData.msg_type === 1) {
    actionType = 'enter'
  } else if (rawData.msg_type === 2) {
    actionType = 'follow'
  } else if (rawData.msg_type === 3) {
    actionType = 'share'
  }
  return {
    user: {
      uid: rawData.uid,
      uname: rawData.uname,
      face: rawData?.face,
      badge: rawData.fans_medal?.target_id ? {
        active: !!rawData.fans_medal?.is_lighted,
        name: rawData.fans_medal?.medal_name,
        level: rawData.fans_medal?.medal_level,
        color: intToColorHex(rawData.fans_medal?.medal_color),
        gradient: [
          intToColorHex(rawData.fans_medal?.medal_color_start),
          intToColorHex(rawData.fans_medal?.medal_color_start),
          intToColorHex(rawData.fans_medal?.medal_color_end),
        ],
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
    action: actionType,
    timestamp: Math.ceil(rawData.trigger_time / 1000000),
  }
}

const parserGuard = (data: any, roomId: number): UserActionMsg => {
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
    action: 'enter',
    timestamp: Math.ceil(rawData.trigger_time / 1000000),
  }
}

const parserLike = (data: any, roomId: number): UserActionMsg => {
  const rawData = data.data
  return {
    user: {
      uid: rawData.uid,
      uname: rawData.uname,
      badge: rawData.fans_medal?.target_id ? {
        active: rawData.fans_medal?.is_lighted,
        name: rawData.fans_medal?.medal_name,
        level: rawData.fans_medal?.medal_level,
        color: intToColorHex(rawData.fans_medal?.medal_color),
        gradient: [
          intToColorHex(rawData.fans_medal?.medal_color_start),
          intToColorHex(rawData.fans_medal?.medal_color_start),
          intToColorHex(rawData.fans_medal?.medal_color_end),
        ],
        anchor: {
          uid: rawData.fans_medal?.target_id,
          uname: '',
          room_id: rawData.fans_medal?.anchor_roomid, // 返回为 0
          is_same_room: rawData.fans_medal?.anchor_roomid === roomId,
        }
      } : undefined,
    },
    action: 'like',
    timestamp: Date.now(),
  }
}

const parser = (data: any, roomId: number): UserActionMsg => {
  const msgType = data.cmd
  if (msgType === 'ENTRY_EFFECT') {
    return parserGuard(data, roomId)
  }
  if (msgType === 'LIKE_INFO_V3_CLICK') {
    return parserLike(data, roomId)
  }
  // INTERACT_WORD
  return parserNormal(data, roomId)
}

export const INTERACT_WORD = {
  parser,
  eventName: 'INTERACT_WORD' as const,
  handlerName: 'onUserAction' as const,
}

export const ENTRY_EFFECT = {
  parser,
  eventName: 'ENTRY_EFFECT' as const,
  handlerName: 'onUserAction' as const,
}

export const LIKE_INFO_V3_CLICK = {
  parser,
  eventName: 'LIKE_INFO_V3_CLICK' as const,
  handlerName: 'onUserAction' as const,
}

export type Handler = {
  /** 用户进入、关注、分享、点赞直播间 */
  onUserAction: (msg: Message<UserActionMsg>) => void
}
