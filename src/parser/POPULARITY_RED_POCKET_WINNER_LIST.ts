import type { Message } from '../types/app'

export interface RedPocketEndMsg {
  /** 红包抽奖id */
  id: number
  /** 中奖人数 */
  total_num: number
  /** 中奖列表 */
  winner: ({
    /** 中奖用户uid */
    uid: number
    /** 中奖用户昵称 */
    uname: string
    /** 奖品id */
    award_id: number
  } & RedPocketEndAward)[]
  /** 红包奖品列表 */
  awards: Record<string, RedPocketEndAward>
}

interface RedPocketEndAward {
  /** 奖品类型，待补充 */
  award_type: number
  /** 奖品名称 */
  award_name: string
  /** 奖品图片 */
  award_pic: string
  /** 奖品图片大图 */
  award_big_pic: string
  /** 奖品价值，除以1000为RMB */
  award_price: number
}

const parser = (data: any, roomId: number): RedPocketEndMsg => {
  const rawData = data.data

  return {
    id: rawData.lot_id,
    total_num: rawData.total_num,
    winner: rawData.winner_info.map((item: any[]) => ({
      uid: item[0],
      uname: item[1],
      award_id: item[3],
      ...rawData.awards[item[3]],
    })),
    awards: rawData.awards,
  }
}

export const POPULARITY_RED_POCKET_WINNER_LIST = {
  parser,
  eventName: 'POPULARITY_RED_POCKET_WINNER_LIST' as const,
  handlerName: 'onRedPocketEnd' as const,
}

export type Handler = {
  /** 红包抽奖结果 */
  onRedPocketEnd: (msg: Message<RedPocketEndMsg>) => void
}
