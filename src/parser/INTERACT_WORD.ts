import { intToColorHex } from '../utils/color'
import type { Message, User } from '../types/app'

export interface NewComerMsg {
  user: User
  /** 入场时间·*/
  timestamp: number
}

const parser = (data: any, roomId: number): NewComerMsg => {
  const rawData = data.data
  return {
    user: {
      uid: rawData.uid,
      uname: rawData.username,
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
    },
    timestamp: rawData.timestamp,
  }
}

export const INTERACT_WORD = {
  parser,
  eventName: 'INTERACT_WORD' as const,
  handlerName: 'onNewComer' as const,
}

export type Handler = {
  onNewComer: (msg: Message<NewComerMsg>) => void
}