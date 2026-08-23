import type { INTERACT_WORD as DataType } from 'tiny-bilibili-ws'
import { decode as decodeInteractWordV2 } from '../protobuf/INTERACT_WORD_V2.proto'
import type { Message, User } from '../types/app'
import { intToColorHex } from '../utils/color'

const ENTRY_UNAME_PATTERN = /<%(.*)%>/

type UserAction = 'enter' | 'follow' | 'share' | 'like' | 'unknown'

export interface UserActionMsg {
  /** 事件类型 */
  action: UserAction
  /** 事件时间，毫秒时间戳 */
  timestamp: number
  user: User
}

const parserInteractWord = (
  data: DataType & { data?: { face?: string } },
  roomId: number
): UserActionMsg | null => {
  const rawData = data?.data
  if (!rawData) {
    return null
  }
  let actionType: UserAction = 'unknown'
  if (rawData.msg_type === 1) {
    actionType = 'enter'
  } else if (rawData.msg_type === 2) {
    actionType = 'follow'
  } else if (rawData.msg_type === 3) {
    actionType = 'share'
  }
  return {
    action: actionType,
    timestamp: Math.ceil(rawData.trigger_time / 1_000_000),
    user: {
      badge: rawData.fans_medal?.target_id
        ? {
            active: !!rawData.fans_medal?.is_lighted,
            anchor: {
              is_same_room: rawData.fans_medal?.anchor_roomid === roomId,
              room_id: rawData.fans_medal?.anchor_roomid,
              uid: rawData.fans_medal?.target_id,
              uname: '',
            },
            color: intToColorHex(rawData.fans_medal?.medal_color),
            gradient: [
              intToColorHex(rawData.fans_medal?.medal_color_start),
              intToColorHex(rawData.fans_medal?.medal_color_start),
              intToColorHex(rawData.fans_medal?.medal_color_end),
            ],
            level: rawData.fans_medal?.medal_level,
            name: rawData.fans_medal?.medal_name,
          }
        : undefined,
      face: rawData?.face,
      identity: {
        guard_level: rawData.privilege_type,
        rank: 0,
        room_admin: false,
      },
      uid: rawData.uid,
      uname: rawData.uname,
    },
  }
}

const parserInteractWordV2 = (data: any, roomId: number): UserActionMsg | null => {
  if (!data?.data?.pb) {
    return null
  }
  const decodedData = decodeInteractWordV2(data.data.pb)
  let actionType: UserAction = 'unknown'
  if (decodedData.msg_type === 1) {
    actionType = 'enter'
  } else if (decodedData.msg_type === 2) {
    actionType = 'follow'
  } else if (decodedData.msg_type === 3) {
    actionType = 'share'
  }
  // 优先使用 uinfo 中的信息，如果没有则使用顶层信息
  const userInfo = decodedData.uinfo || {}
  const fansMedal = decodedData.fans_medal || userInfo?.medal_info
  const anchorUid = fansMedal?.target_id || fansMedal?.ruid

  return {
    action: actionType,
    timestamp: Math.ceil(decodedData.trigger_time / 1_000_000),
    user: {
      badge:
        fansMedal && anchorUid
          ? {
              active: !!fansMedal.is_lighted,
              anchor: {
                is_same_room: fansMedal.room_id === roomId,
                room_id: fansMedal.room_id,
                uid: anchorUid,
                uname: '',
              },
              color: intToColorHex(fansMedal.color),
              gradient: [
                intToColorHex(fansMedal.color_start),
                intToColorHex(fansMedal.color_start),
                intToColorHex(fansMedal.color_end),
              ],
              level: fansMedal.medal_level,
              name: fansMedal.medal_name,
            }
          : undefined,
      face: userInfo.base?.face,
      identity: {
        guard_level: fansMedal?.guard_level || userInfo?.guard?.level || 0,
        rank: 0,
        room_admin: false,
      },
      uid: userInfo.uid || decodedData.uid,
      uname: userInfo.base?.uname || decodedData.uname,
    },
  } satisfies UserActionMsg
}

const parserGuard = (data: any, roomId: number): UserActionMsg | null => {
  const rawData = data?.data
  if (!rawData) {
    return null
  }
  const uname = ENTRY_UNAME_PATTERN.exec(rawData.copy_writing ?? '')?.[1] || ''
  return {
    action: 'enter',
    timestamp: Math.ceil(rawData.trigger_time / 1_000_000),
    user: {
      identity: {
        guard_level: rawData.privilege_type,
        rank: 0,
        room_admin: false,
      },
      uid: rawData.uid,
      uname, // 超长会有省略号
    },
  }
}

const parserLike = (data: any, roomId: number): UserActionMsg | null => {
  const rawData = data?.data
  if (!rawData) {
    return null
  }
  return {
    action: 'like',
    timestamp: Date.now(),
    user: {
      badge: rawData.fans_medal?.target_id
        ? {
            active: rawData.fans_medal?.is_lighted,
            anchor: {
              is_same_room: rawData.fans_medal?.anchor_roomid === roomId,
              room_id: rawData.fans_medal?.anchor_roomid, // 返回为 0
              uid: rawData.fans_medal?.target_id,
              uname: '',
            },
            color: intToColorHex(rawData.fans_medal?.medal_color),
            gradient: [
              intToColorHex(rawData.fans_medal?.medal_color_start),
              intToColorHex(rawData.fans_medal?.medal_color_start),
              intToColorHex(rawData.fans_medal?.medal_color_end),
            ],
            level: rawData.fans_medal?.medal_level,
            name: rawData.fans_medal?.medal_name,
          }
        : undefined,
      uid: rawData.uid,
      uname: rawData.uname,
    },
  }
}

const parser = (data: any, roomId: number): UserActionMsg | null => {
  const msgType = data.cmd
  if (msgType === 'ENTRY_EFFECT') {
    return parserGuard(data, roomId)
  }
  if (msgType === 'LIKE_INFO_V3_CLICK') {
    return parserLike(data, roomId)
  }
  if (msgType === 'INTERACT_WORD_V2') {
    return parserInteractWordV2(data, roomId)
  }
  // INTERACT_WORD
  return parserInteractWord(data, roomId)
}

export const INTERACT_WORD = {
  eventName: 'INTERACT_WORD' as const,
  handlerName: 'onUserAction' as const,
  parser,
}

export const ENTRY_EFFECT = {
  eventName: 'ENTRY_EFFECT' as const,
  handlerName: 'onUserAction' as const,
  parser,
}

export const LIKE_INFO_V3_CLICK = {
  eventName: 'LIKE_INFO_V3_CLICK' as const,
  handlerName: 'onUserAction' as const,
  parser,
}

export const INTERACT_WORD_V2 = {
  eventName: 'INTERACT_WORD_V2' as const,
  handlerName: 'onUserAction' as const,
  parser,
}

export type Handler = {
  /** 用户进入、关注、分享、点赞直播间 */
  onUserAction: (msg: Message<UserActionMsg>) => void
}
