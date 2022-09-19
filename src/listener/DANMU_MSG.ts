import { intToColorHex } from '../utils/color'

import type { User } from '../app'

export interface DanmuMsg {
  user: User
  content: string
}

const parser = (data: any): DanmuMsg => {
  const content = data.info[1]
  const username = data.info[2][1]
  const badge: DanmuMsg['user']['badge'] = data.info[3].length ? {
    name: data.info[3][1],
    level: data.info[3][0],
    color: intToColorHex(data.info[3][4]),
    anchor: {
      uid: data.info[3][12],
      uname: data.info[3][2],
      room_id: data.info[3][3],
    },
  } : undefined
  return {
    user: {
      uid: data.info[2][0],
      uname: username,
      badge,
      identity: {
        rank: data.info[4][4],
        member: data.info[7],
        room_admin: data.info[2][2] === 1,
      },
    },
    content,
    emoticon: data.info[0][13],
  }
}

export const DANMU_MSG = {
  parser,
  eventName: 'DANMU_MSG',
  handlerName: 'onIncomeDanmu',
  handlerNameRaw: 'onIncomeDanmuRaw',
}

export type DanmuHandler = {
  onIncomeDanmu: (data: DanmuMsg) => void
}