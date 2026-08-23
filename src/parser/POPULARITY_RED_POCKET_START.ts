import type { POPULARITY_RED_POCKET_START as DataType } from 'tiny-bilibili-ws'
import type { Message, User } from '../types/app'

export interface RedPocketStartMsg {
  /** 红包奖品 */
  awards: RedPocketStartAward[]
  /** 口令弹幕内容 */
  danmu: string
  /** 持续时间，秒 */
  duration: number
  /** 结束时间，秒级时间戳 */
  end_time: number
  /** 红包抽奖id */
  id: number
  /** 开始时间，秒级时间戳 */
  start_time: number
  /** 奖品总价值，除以1000为RMB */
  total_price: number
  /** 红包发送用户 */
  user: User
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

const parser = (data: DataType, roomId: number): RedPocketStartMsg => {
  const rawData = data.data

  return {
    awards: rawData.awards,
    danmu: rawData.danmu,
    duration: rawData.last_time,
    end_time: rawData.end_time,
    id: rawData.lot_id,
    start_time: rawData.start_time,
    total_price: rawData.total_price,
    user: {
      face: rawData.sender_face,
      uid: rawData.sender_uid,
      uname: rawData.sender_name,
    },
    wait_num: rawData.wait_num,
  }
}

export const POPULARITY_RED_POCKET_START = {
  eventName: 'POPULARITY_RED_POCKET_START' as const,
  handlerName: 'onRedPocketStart' as const,
  parser,
}

export type Handler = {
  /** 红包抽奖开始 */
  onRedPocketStart: (msg: Message<RedPocketStartMsg>) => void
}
