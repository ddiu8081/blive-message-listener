export interface User {
  /** 用户uid */
  uid: number
  /** 用户名 */
  uname: string
  /** 用户头像 */
  face?: string
  /** 用户牌子·*/
  badge?: {
    /** 是否点亮 */
    active: boolean
    /** 牌子名称 */
    name: string
    /** 牌子等级 */
    level: number
    /** 牌子颜色 */
    color: string
    /** 主播信息 */
    anchor: {
      uid: number
      uname: string
      room_id: number
    }
  }
  /** 用户身份 */
  identity?: {
    /** 直播榜单排名 */
    rank: 0 | 1 | 2 | 3
    /** 大航海信息 */
    guard_level: GuardLevel
    /** 房管 */
    room_admin: boolean
  }
}

export enum GuardLevel {
  /** 无 */
  None = 0,
  /** 总督 */
  Zongdu = 1,
  /** 提督 */
  Tidu = 2,
  /** 舰长 */
  Jianzhang = 3,
}

export interface Message<T> {
  id: string,
  timestamp: number,
  type: string,
  body: T
}

export interface BaseMsg {
  user: User
}
