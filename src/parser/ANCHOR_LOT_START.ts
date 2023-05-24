import type { Message } from '../types/app'
import type { ANCHOR_LOT_START as DataType } from 'tiny-bilibili-ws'

export interface AnchorLotteryStartMsg {
  /** 天选抽奖id */
  id: number
  /** 开始时间，秒级时间戳 */
  start_time: number
  /** 持续时间，秒 */
  duration: number
  /** 天选奖品信息 */
  award: {
    /** 奖品图片 */
    image: string
    /** 奖品名称 */
    name: string
    /** 奖品数量 */
    num: number
    /** 是否为虚拟礼物奖品 */
    virtual: boolean
    /** 虚拟奖品价值描述，实物奖品为空 */
    price_text: string
  }
  /** 抽奖要求 */
  require: {
    /** 口令弹幕内容，无需弹幕为空字符串 */
    danmu: string
    /** 需送主播礼物，无需送礼为空 */
    gift: {
      /** 礼物id */
      id: string
      /** 礼物名称 */
      name: string
      /** 礼物数量 */
      num: number
      /** 单个礼物价值，除以1000为RMB */
      price: number
    } | null
    /** 抽奖参与人群要求，无要求为空 */
    user: {
      /** 参与人群限制（关注/粉丝勋章/大航海） */
      type: 'follow' | 'medal' | 'guard'
      /** 参与人群限制等级，如粉丝勋章等级 */
      value: number
      /** 参与人群限制描述 */
      text: string
    } | null
  }
}

const parser = (data: DataType, roomId: number): AnchorLotteryStartMsg => {
  const rawData = data.data

  return {
    id: rawData.id,
    start_time: rawData.current_time,
    duration: rawData.max_time,
    award: {
      image: rawData.award_image,
      name: rawData.award_name,
      num: rawData.award_num,
      virtual: (rawData as any).award_type === 1,
      price_text: (rawData as any).award_price_text || '',
    },
    require: {
      danmu: rawData.danmu || '',
      gift: rawData.gift_id ? {
        id:  `${rawData.gift_id}`,
        name: rawData.gift_name,
        num: rawData.gift_num,
        price: rawData.gift_price,
      } : null,
      user: rawData.require_type ? {
        type: (['follow', 'medal', 'guard'] as const)[rawData.require_type - 1],
        value: rawData.require_value,
        text: rawData.require_text,
      } : null,
    },
  }
}

export const ANCHOR_LOT_START = {
  parser,
  eventName: 'ANCHOR_LOT_START' as const,
  handlerName: 'onAnchorLotteryStart' as const,
}

export type Handler = {
  /** 主播天选时刻抽奖开启 */
  onAnchorLotteryStart: (msg: Message<AnchorLotteryStartMsg>) => void
}
