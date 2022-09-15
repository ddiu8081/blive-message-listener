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

export interface DanmuMsg {
  user: User
  content: string
  emoticon?: {
    id: string
    height: number
    width: number
    url: string
  }
}

interface SuperChatMsg {
  user: User
  content: string
  content_color: string
  price: number
  time: number
}

interface GuardBuyMsg {
  user: User
  gift_id: number
  gift_name: string
  guard_level: number
  price: number
  start_time: number
  end_time: number
}

interface GiftMsg {
  user: User
  gift_id: number
  gift_name: string
  price: number
  amount: number
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
