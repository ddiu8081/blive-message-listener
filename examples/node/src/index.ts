import { type MsgHandler, startListen } from '../../../src/index.ts'

const roomId = Number.parseInt(Bun.argv[2] ?? Bun.env.BILIBILI_ROOM_ID ?? '', 10)

if (!Number.isSafeInteger(roomId) || roomId <= 0) {
  console.error('Usage: bun run dev <long-room-id>')
  console.error('Or copy .env.example to .env and set BILIBILI_ROOM_ID.')
  process.exit(1)
}

const timestamp = () => new Date().toLocaleTimeString('zh-CN', { hour12: false })
const print = (label: string, body?: unknown) => {
  const detail = body === undefined ? '' : ` ${JSON.stringify(body)}`
  console.log(`[${timestamp()}] ${label}${detail}`)
}

const handler: MsgHandler = {
  onAttentionChange: (message) => print('热度', message.body),
  onClose: () => print('连接已关闭'),
  onError: (error) => print('连接错误', error.message),
  onGift: (message) => print('礼物', message.body),
  onIncomeDanmu: (message) => print('弹幕', message.body),
  onIncomeSuperChat: (message) => print('醒目留言', message.body),
  onLiveEnd: (message) => print('直播结束', message.body),
  onLiveStart: (message) => print('直播开始', message.body),
  onOpen: () => print('连接已建立'),
  onRoomInfoChange: (message) => print('房间信息', message.body),
  onStartListen: () => print(`开始监听房间 ${roomId}`),
  onUserAction: (message) => print('用户动态', message.body),
  onWatchedChange: (message) => print('观看人数', message.body),
}

const uid = Number.parseInt(Bun.env.BILIBILI_UID ?? '', 10)
const key = Bun.env.BILIBILI_KEY
const buvid = Bun.env.BILIBILI_BUVID
const cookie = Bun.env.BILIBILI_COOKIE

let ws: NonNullable<Parameters<typeof startListen>[2]>['ws']
if (cookie) {
  ws = { headers: { Cookie: cookie } }
} else if (Number.isSafeInteger(uid) && key && buvid) {
  ws = { buvid, key, platform: 'web', uid }
}

const listener = startListen(roomId, handler, ws ? { ws } : undefined)

const close = () => {
  print('正在停止监听')
  listener.close()
}

const shutdown = () => {
  close()
  process.exit(0)
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)

const runForMs = Number.parseInt(Bun.env.BILIBILI_RUN_FOR_MS ?? '', 10)
if (Number.isSafeInteger(runForMs) && runForMs > 0) {
  setTimeout(shutdown, runForMs)
}
