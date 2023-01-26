import type { Message, User } from '../types/app'

export interface RedPocketStartMsg {
  /** 红包抽奖id */
  id: number
  /** 红包发送用户 */
  user: User
  /** 开始时间，秒级时间戳 */
  start_time: number
  /** 结束时间，秒级时间戳 */
  end_time: number
  /** 持续时间，秒 */
  duration: number
  /** 口令弹幕内容 */
  danmu: string
  /** 红包奖品 */
  awards: RedPocketStartAward[]
  /** 奖品总价值，除以1000为RMB */
  total_price: number
  /** 剩余等待的红包数 */
  wait_num: number
}

interface RedPocketStartAward {
  /** 奖品id */
  gift_id: number
  /** 奖品名称 */
  gift_name: string
  /** 奖品图片 */
  gift_pic: string
  /** 奖品数量 */
  num: number
}

const parser = (data: any, roomId: number): RedPocketStartMsg => {
  const rawData = data.data

  return {
    id: rawData.lot_id,
    user: {
      uid: rawData.sender_uid,
      uname: rawData.sender_name,
      face: rawData.sender_face,
    },
    start_time: rawData.start_time,
    end_time: rawData.end_time,
    duration: rawData.last_time,
    danmu: rawData.danmu,
    awards: rawData.awards,
    total_price: rawData.total_price,
    wait_num: rawData.wait_num,
  }
}

export const POPULARITY_RED_POCKET_START = {
  parser,
  eventName: 'POPULARITY_RED_POCKET_START' as const,
  handlerName: 'onRedPocketStart' as const,
}

export type Handler = {
  /** 红包抽奖开始 */
  onRedPocketStart: (msg: Message<RedPocketStartMsg>) => void
}
