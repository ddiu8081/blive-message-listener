# blive-message-listener

[![npm](https://img.shields.io/npm/v/blive-message-listener)](https://www.npmjs.com/package/blive-message-listener)

类型友好的 Bilibili 直播间弹幕监听库。

## Features

- 将 [原始数据](mock) 转为更友好的格式输出
- Node 环境与浏览器环境支持
- 支持监听与获取原始消息

## Install

```bash

npm i blive-message-listener

```

## Usage

```ts
import { startListen, type MsgHandler } from 'blive-message-listener'
// 浏览器环境，从 '/browser' 导入 startListen
// import { startListen } from 'blive-message-listener/browser'

const handler: MsgHandler = {
  onIncomeDanmu: (msg) => {
    console.log(msg.id, msg.body)
  },
  onIncomeSuperChat: (msg) => {
    console.log(msg.id, msg.body)
  },
}

const instance = startListen(652581, handler)

instance.close()
```

> 需传入房间的长id。短id需转为长id才能接收到消息。(https://github.com/ddiu8081/blive-message-listener/issues/19)

## Handlers & Type Definitions

### Common

```ts
const startListen: (roomId: number, handler: MsgHandler) => MessageListener

export interface MessageListener {
  /** 直播间房间号 */
  roomId: number
  /** 关闭连接 */
  close: () => void
  /** 刷新当前直播间热度 */
  getAttention: () => Promise<number>
}

export interface Message<T> {
  /** 消息id */
  id: string,
  /** 接收消息的时间，毫秒时间戳 */
  timestamp: number,
  /** 消息类型 */
  type: string,
  /** 消息内容 */
  body: T
  /** 原始消息内容 */
  raw: any
}

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
    /** 渐变色牌子，当用户长时间未消费，则会变为灰色，即 `#c0c0c0` */
    gradient?: [string, string, string]
    /** 主播信息 */
    anchor: {
      /** 主播uid */
      uid: number
      /** 主播用户名 */
      uname: string
      /** 主播房间号 */
      room_id: number
      /** 是否为本直播间 */
      is_same_room?: boolean
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
```

### Handler

Type definition can be also found in [src/parser](src/parser).

#### 连接基础信息

| Handler | Description |
| --- | --- |
| onOpen | 连接成功 |
| onClose | 连接关闭 |
| onError | 连接错误 |
| onStartListen | 开始监听消息 |

<details>
<summary>Type Definitions</summary>
  
##### Handler.onOpen

连接成功

```ts
export type Handler = {
  /** 连接成功 */
  onOpen: () => void,
}
```

##### Handler.onClose

连接关闭

```ts
export type Handler = {
  /** 连接关闭 */
  onClose: () => void,
}
```

##### Handler.onError

连接错误

```ts
export type Handler = {
  /** 连接错误 */
  onError: (e: Error) => void,
}
```

##### Handler.onStartListen

开始监听消息

```ts
export type Handler = {
  /** 开始监听消息 */
  onStartListen: () => void,
}
```
</details>

#### 直播间基础信息

| Handler | Description |
| --- | --- |
| onLiveStart | 直播开始消息 |
| onLiveEnd | 直播结束消息 |
| onAttentionChange | 直播间热度变化 |
| onWatchedChange | 累计看过人数变化 |
| onLikedChange | 累计点赞人数变化 |
| onRankCountChange | 高能用户人数变化 |
| onUserAction | 用户进入、关注、分享、点赞直播间 |
| onRoomInfoChange | 直播间信息修改 |

<details>
<summary>Type Definitions</summary>

##### handler.onLiveStart

直播开始消息

```ts
export type Handler = {
  /** 直播开始消息 */
  onLiveStart: (msg: Message<LiveStartMsg>) => void
}

type msgType = 'LIVE'

export interface LiveStartMsg {
  /** 开播平台 */
  live_platform: string
  /** 房间号 */
  room_id: number
}
```

##### handler.onLiveEnd

直播结束消息

```ts
export type Handler = {
  /** 直播结束消息 */
  onLiveEnd: (msg: Message<LiveEndMsg>) => void
}

type msgType = 'PREPARING'

export interface LiveEndMsg {
  /** 房间号 */
  room_id: number
}
```

##### handler.onAttentionChange

直播间热度变化

```ts
export type Handler = {
  /** 直播间热度变化 */
  onAttentionChange: (msg: Message<AttentionChangeMsg>) => void
}

type msgType = 'heartbeat'

export interface AttentionChangeMsg {
  /** 直播间热度 */
  attention: number
}
```

##### handler.onWatchedChange

累计看过人数变化

```ts
export type Handler = {
  /** 累计看过人数变化 */
  onWatchedChange: (msg: Message<WatchedChangeMsg>) => void
}

type msgType = 'WATCHED_CHANGE'

export interface WatchedChangeMsg {
  /** 累计入场人数 */
  num: number
  /** 累计入场人数，格式化输出 */
  text_small: string
}
```

##### handler.onLikedChange

累计点赞人数变化

```ts
export type Handler = {
  /** 累计点赞人数变化 */
  onLikedChange: (msg: Message<LikedChangeMsg>) => void
}

type msgType = 'LIKE_INFO_V3_UPDATE'

export interface LikedChangeMsg {
  /** 直播间点赞人数 */
  count: number
}
```

##### handler.onRankCountChange

高能用户人数变化

```ts
export type Handler = {
  /** 高能用户人数变化 */
  onRankCountChange: (msg: Message<RankCountChangeMsg>) => void
}

type msgType = 'ONLINE_RANK_COUNT'

export interface RankCountChangeMsg {
  /** 高能用户人数 */
  count: number
}
```

##### handler.onUserAction

用户进入、关注、分享、点赞直播间

- 舰长进入直播间时，有几率会触发两次
- 舰长进入直播间时，uname 超长可能会省略号截断

```ts
export type Handler = {
  /** 用户进入、关注、分享、点赞直播间 */
  onUserAction: (msg: Message<UserActionMsg>) => void
}

type msgType = 'INTERACT_WORD' | 'ENTRY_EFFECT' | 'LIKE_INFO_V3_CLICK'

type UserAction = 'enter' | 'follow' | 'share' | 'like' | 'unknown'

export interface UserActionMsg {
  user: User
  /** 事件类型 */
  action: UserAction
  /** 事件时间，毫秒时间戳 */
  timestamp: number
}
```

##### handler.onRoomInfoChange

直播间信息修改

```ts
export type Handler = {
  /** 直播间信息修改 */
  onRoomInfoChange: (msg: Message<RoomInfoChangeMsg>) => void
}

type msgType = 'ROOM_CHANGE'

export interface RoomInfoChangeMsg {
  /** 直播间标题 */
  title: string
  /** 一级分区id */
  parent_area_id: number
  /** 一级分区名 */
  parent_area_name: string
  /** 二级分区id */
  area_id: number
  /** 二级分区名 */
  area_name: string
}
```
</details>

#### 弹幕相关

| Handler | Description |
| --- | --- |
| onIncomeDanmu | 收到普通弹幕消息 |
| onIncomeSuperChat | 收到醒目留言 |

<details>
<summary>Type Definitions</summary>

##### handler.onIncomeDanmu

收到普通弹幕消息

```ts
export type Handler = {
  /** 收到普通弹幕消息 */
  onIncomeDanmu: (msg: Message<DanmuMsg>) => void
}

type msgType = 'DANMU_MSG'

export interface DanmuMsg {
  user: User
  /** 弹幕内容 */
  content: string
  /** 发送时间，毫秒时间戳 */
  timestamp: number
  /** 是否为天选抽奖弹幕 */
  lottery: boolean
  /** 表情弹幕内容 */
  emoticon?: {
    id: string
    height: number
    width: number
    url: string
  }
  /** 弹幕内小表情映射，key为表情文字，如"[妙]" */
  in_message_emoticon?: Record<string, {
    id: string
    emoticon_id: number
    height: number
    width: number
    url: string
    description: string
  }>
}
```

##### handler.onIncomeSuperChat

收到醒目留言

```ts
export type Handler = {
  /** 收到醒目留言 */
  onIncomeSuperChat: (msg: Message<SuperChatMsg>) => void
}

type msgType = 'SUPER_CHAT_MESSAGE'

export interface SuperChatMsg {
  /** 消息id */
  id: number
  /** 发送用户 */
  user: User
  /** 弹幕内容 */
  content: string
  /** 弹幕颜色 */
  content_color: string
  /** 价格，RMB */
  price: number
  /** 持续时间 */
  time: number
}
```
</details>

#### 礼物相关

| Handler | Description |
| --- | --- |
| onGift | 收到礼物 |
| onGuardBuy | 舰长上舰消息 |

<details>
<summary>Type Definitions</summary>

##### handler.onGift

收到礼物

* 礼物信息的用户牌子可见，但没有牌子对应主播的用户名及房间号，也无法判断 `is_same_room` 是否为本直播间。

```ts
export type Handler = {
  /** 收到礼物 */
  onGift: (msg: Message<GiftMsg>) => void
}

type msgType = 'SEND_GIFT'

export interface GiftMsg {
  user: User
  /** 礼物id */
  gift_id: number
  /** 礼物名称 */
  gift_name: string
  /** 礼物价格类型 */
  coin_type: 'silver' | 'gold'
  /** 礼物价格，除以1000为RMB */
  price: number
  /** 礼物数量 */
  amount: number
  /** 送礼指向主播信息，多人直播间可指定要送给的主播，单人直播间为空 */
  send_master?: {
    uid: number
    uname: string
    room_id: number
  }
  /** 礼物连击 */
  combo?: {
    /** 连击id */
    batch_id: string
    /** 当前连击数（礼物总数） */
    combo_num: number
    /** 连击礼物总价格，除以1000为RMB */
    total_price: number
  }
}
```

##### handler.onGuardBuy

舰长上舰消息

```ts
export type Handler = {
  /** 舰长上舰消息 */
  onGuardBuy: (msg: Message<GuardBuyMsg>) => void
}

type msgType = 'GUARD_BUY'

export interface GuardBuyMsg {
  user: User
  /** 礼物id */
  gift_id: number
  /** 礼物名称 */
  gift_name: string
  /** 大航海信息 */
  guard_level: GuardLevel
  /** 价格，RMB */
  price: number
  /** 等级生效时间 */
  start_time: number
  /** 等级过期时间 */
  end_time: number
}
```
</details>

#### 房间管理相关

| Handler | Description |
| --- | --- |
| onRoomWarn | 房间被超管警告、切断 |
| onRoomSilent | 房间开启、关闭全局禁言 |
| onRoomAdminSet | 房间设立、撤销房管 |

<details>
<summary>Type Definitions</summary>

##### handler.onRoomWarn

房间被超管警告、切断

```ts
export type Handler = {
  /** 房间被超管警告、切断 */
  onRoomWarn: (msg: Message<RoomWarnMsg>) => void
}

type msgType = 'WARNING' ｜ 'CUT_OFF'

export interface RoomWarnMsg {
  /** 处理类型 */
  type: 'warning' | 'cut'
  /** 处理原因 */
  msg: string
}
```

##### handler.onRoomSilent

房间开启、关闭全局禁言

```ts
export type Handler = {
  /** 房间开启、关闭全局禁言 */
  onRoomSilent: (msg: Message<RoomSilentMsg>) => void
}

type msgType = 'ROOM_SILENT_ON' ｜ 'ROOM_SILENT_OFF'

export interface RoomSilentMsg {
  /** 禁言类型（按用户等级、勋章等级、全员、关闭） */
  type: 'level' | 'medal' | 'member' | 'off'
  /** 禁言等级 */
  level: number
  /** 禁言结束时间，秒级时间戳，-1 为无限 */
  second: number
}
```

##### handler.onRoomAdminSet

房间设立、撤销房管

```ts
export type Handler = {
  /** 房间设立、撤销房管 */
  onRoomAdminSet: (msg: Message<RoomAdminSetMsg>) => void
}

type msgType = 'room_admin_entrance' ｜ 'ROOM_ADMIN_REVOKE'

export interface RoomAdminSetMsg {
  /** 类型（设立、撤销） */
  type: 'set' | 'revoke'
  /** 用户uid */
  uid: number
}
```
</details>

#### 监听原始消息

```ts
export type Handler = {
  /** 原始消息 */
  raw: Record<'msg' | string, (msg: any) => void>
}
```

可在 `raw` 中监听任意原始消息。

example:

```ts
const handler: MsgHandler = {
  raw: {
    'msg': (msg) => {
      // 监听所有 cmd 消息
      console.log(msg)
    },
    'INTERACT_WORD': (msg) => {
      // 监听特定的 cmd
      console.log(msg)
    },
  }
}

startListen(652581, handler)
```

## Credits

- Based on [tiny-bilibili-ws](https://github.com/starknt/tiny-bilibili-ws)

## License

MIT
