interface User {
  uid: number
  uname: string
  badge?: {
    name: string
    level: number
    color: string
    streamer: {
      uid: number
      uname: string
      room_id: number
    }
  }
  identity?: {
    rank: number
    member: number
    room_admin: boolean
  }
}

interface DanmuMsg {
  user: User
  content: string
}

interface SuperChatMsg {
  user: User
  content: string
  price: number
  time: number
}

interface GuardBuyMsg {
  user: User
  price: number
  gift_name: string
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
}
