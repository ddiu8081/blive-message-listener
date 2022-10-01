# blive-message-listener

[![npm](https://img.shields.io/npm/v/blive-message-listener)](https://www.npmjs.com/package/blive-message-listener)

Bilibili-live danmu listener with type.

Bilibili 直播间弹幕监听器，支持类型输出。

## Features

- 完整的类型支持
- Node 环境与浏览器环境支持

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
  /** 连接成功 */
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

#### 直播间基础信息

| Handler | Description |
| --- | --- |
| onLiveStart | 直播开始消息 |
| onLiveEnd | 直播结束消息 |
| onAttentionChange | 直播间热度更新消息 |
| onWatchedChange | 累计看过人数变化 |
| onNewComer | 观众进入直播间 |

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

直播间热度更新消息

```ts
export type Handler = {
  /** 直播间热度更新消息 */
  onAttentionChange: (msg: Message<AttentionChangeMsg>) => void
}

type msgType = 'heartbeat'

export interface AttentionChangeMsg {
  /** 直播间热度 */
  attention: number
}
```

#### handler.onWatchedChange

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

##### handler.onNewComer

观众进入直播间

- 包括普通用户进入与舰长进入
- 舰长进入直播间时，有几率会触发两次
- 舰长进入直播间时，uname 超长可能会省略号截断

```ts
export type Handler = {
  /** 观众进入直播间 */
  onNewComer: (msg: Message<NewComerMsg>) => void
}

type msgType = 'INTERACT_WORD' | 'ENTRY_EFFECT'

export interface NewComerMsg {
  user: User
  /** 入场时间，毫秒时间戳 */
  timestamp: number
}
```

#### 弹幕相关

| Handler | Description |
| --- | --- |
| onIncomeDanmu | 收到普通弹幕消息 |
| onIncomeSuperChat | 收到醒目留言 |

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
  content: string
  /** 发送时间，毫秒时间戳 */
  timestamp: number
  /** 是否为天选抽奖弹幕 */
  lottery: boolean
  /** 弹幕表情 */
  emoticon?: {
    id: string
    height: number
    width: number
    url: string
  }
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

#### 礼物相关

| Handler | Description |
| --- | --- |
| onGift | 收到礼物 |
| onGuardBuy | 舰长上舰消息 |

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

## Credits

- Based on [tiny-bilibili-ws](https://github.com/starknt/tiny-bilibili-ws)

## License

MIT
