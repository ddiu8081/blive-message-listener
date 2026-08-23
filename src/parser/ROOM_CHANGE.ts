import type { ROOM_CHANGE as DataType } from 'tiny-bilibili-ws'
import type { Message } from '../types/app'

export interface RoomInfoChangeMsg {
  /** 二级分区id */
  area_id: number
  /** 二级分区名 */
  area_name: string
  /** 一级分区id */
  parent_area_id: number
  /** 一级分区名 */
  parent_area_name: string
  /** 直播间标题 */
  title: string
}

const parser = (data: DataType): RoomInfoChangeMsg => {
  const rawData = data.data
  return {
    area_id: rawData.area_id,
    area_name: rawData.area_name,
    parent_area_id: rawData.parent_area_id,
    parent_area_name: rawData.parent_area_name,
    title: rawData.title,
  }
}

export const ROOM_CHANGE = {
  eventName: 'ROOM_CHANGE' as const,
  handlerName: 'onRoomInfoChange' as const,
  parser,
}

export type Handler = {
  /** 直播间信息修改 */
  onRoomInfoChange: (msg: Message<RoomInfoChangeMsg>) => void
}
