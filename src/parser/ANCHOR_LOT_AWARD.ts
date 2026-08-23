import type { ANCHOR_LOT_AWARD as DataType } from 'tiny-bilibili-ws'
import type { Message } from '../types/app'

export interface AnchorLotteryEndMsg {
  /** 天选奖品信息 */
  award: {
    /** 奖品图片 */
    image: string
    /** 奖品名称 */
    name: string
    /** 是否为虚拟礼物奖品 */
    virtual: boolean
  }
  /** 天选抽奖id */
  id: number
  /** 中奖用户列表 */
  winner: {
    /** 用户uid */
    uid: number
    /** 用户昵称 */
    uname: string
    /** 用户头像 */
    face: number
    /** 用户粉丝勋章等级 */
    level: number
    /** 中奖数量 */
    num: number
  }[]
}

const parser = (data: DataType, roomId: number): AnchorLotteryEndMsg => {
  const rawData = data.data

  return {
    award: {
      image: rawData.award_image,
      name: rawData.award_name,
      virtual: (rawData as any).award_type === 1,
    },
    id: rawData.id,
    winner: rawData.award_users.map((user: any) => ({
      face: user.face,
      level: user.level,
      num: user.num,
      uid: user.uid,
      uname: user.uname,
    })),
  }
}

export const ANCHOR_LOT_AWARD = {
  eventName: 'ANCHOR_LOT_AWARD' as const,
  handlerName: 'onAnchorLotteryEnd' as const,
  parser,
}

export type Handler = {
  /** 主播天选时刻抽奖结果 */
  onAnchorLotteryEnd: (msg: Message<AnchorLotteryEndMsg>) => void
}
