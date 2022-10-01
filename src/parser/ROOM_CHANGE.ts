import type { Message } from '../types/app'

export interface RoomInfoChangeMsg {
  /** 直播间标题 */
  title: number
  /** 一级分区id */
  parent_area_id: number
  /** 一级分区名 */
  parent_area_name: number
  /** 二级分区id */
  area_id: number
  /** 二级分区名 */
  area_name: number
}

const parser = (data: any): RoomInfoChangeMsg => {
  const rawData = data.data
  return {
    title: rawData.title,
    parent_area_id: rawData.parent_area_id,
    parent_area_name: rawData.parent_area_name,
    area_id: rawData.area_id,
    area_name: rawData.area_name,
  }
}

export const ROOM_CHANGE = {
  parser,
  eventName: 'ROOM_CHANGE' as const,
  handlerName: 'onRoomInfoChange' as const,
}

export type Handler = {
  /** 直播间信息修改 */
  onRoomInfoChange: (msg: Message<RoomInfoChangeMsg>) => void
}