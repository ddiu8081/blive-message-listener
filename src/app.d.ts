interface User {
  uid: number
  uname: string
  face?: string
  badge?: {
    active: boolean
    name: string
    level: number
    color: string
    anchor: {
      uid: number
      uname: string
      room_id: number
    }
  }
  identity?: {
    rank: number
    guard_level: number
    room_admin: boolean
  }
}

interface SuperChatMsg {
  user: User
  content: string
  content_color: string
  price: number
  time: number
}

interface GiftMsg {
  user: User
  gift_id: number
  gift_name: string
  price: number
  amount: number
}

export interface Danmu<T extends BaseMsg> {
  id: string,
  timestamp: number,
  type: string,
  data: T
}

export interface BaseMsg {
  user: User
}

export interface RoomMsgHandler {
  onHeartbeat?: (online: number) => void
  onIncomeDanmu?: (data: DanmuMsg) => void
  onIncomeDanmuRaw?: (data: any) => void
  onWatchedChange?: (newWatched: number) => void
  onWatchedChangeRaw?: (data: any) => void
  onIncomeSuperChat?: (data: SuperChatMsg) => void
  onIncomeSuperChatRaw?: (data: any) => void
  onGuardBuy?: (data: GuardBuyMsg) => void
  onGuardBuyRaw?: (data: any) => void
  onGift?: (data: GiftMsg) => void
  onGiftRaw?: (data: any) => void
}
