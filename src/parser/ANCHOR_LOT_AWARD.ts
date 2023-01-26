import type { Message } from '../types/app'

export interface AnchorLotteryEndMsg {
  /** 天选抽奖id */
  id: number
  /** 天选奖品信息 */
  award: {
    /** 奖品图片 */
    image: string
    /** 奖品名称 */
    name: string
    /** 是否为虚拟礼物奖品 */
    virtual: boolean
  }
  /** 中奖用户列表 */
  winner: ({
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
  })[]
}

const parser = (data: any, roomId: number): AnchorLotteryEndMsg => {
  const rawData = data.data

  return {
    id: rawData.id,
    award: {
      image: rawData.award_image,
      name: rawData.award_name,
      virtual: rawData.award_type === 1,
    },
    winner: rawData.award_users.map((user: any) => ({
      uid: user.uid,
      uname: user.uname,
      face: user.face,
      level: user.level,
      num: user.num,
    })),
  }
}

export const ANCHOR_LOT_AWARD = {
  parser,
  eventName: 'ANCHOR_LOT_AWARD' as const,
  handlerName: 'onAnchorLotteryEnd' as const,
}

export type Handler = {
  /** 主播天选时刻抽奖结果 */
  onAnchorLotteryEnd: (msg: Message<AnchorLotteryEndMsg>) => void
}
