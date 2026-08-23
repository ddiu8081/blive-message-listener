import { startListen } from '../../../src/browser.ts'
import type { MessageListener, MsgHandler } from '../../../src/index.ts'

const form = document.querySelector<HTMLFormElement>('#connection-form')
const status = document.querySelector<HTMLElement>('#status')
const messages = document.querySelector<HTMLOListElement>('#messages')
const count = document.querySelector<HTMLElement>('#message-count')
const disconnectButton = document.querySelector<HTMLButtonElement>('#disconnect')
const clearButton = document.querySelector<HTMLButtonElement>('#clear')

if (!(form && status && messages && count && disconnectButton && clearButton)) {
  throw new Error('Example UI is incomplete')
}

let listener: MessageListener | undefined
let messageCount = 0

const setStatus = (label: string, state: 'idle' | 'connecting' | 'live' | 'error') => {
  status.textContent = label
  status.dataset.state = state
}

const appendMessage = (type: string, body?: unknown) => {
  messageCount += 1
  count.textContent = `${messageCount} 条`

  const item = document.createElement('li')
  const time = document.createElement('time')
  const label = document.createElement('strong')
  const payload = document.createElement('pre')

  time.textContent = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  label.textContent = type
  payload.textContent = body === undefined ? '' : JSON.stringify(body, null, 2)
  item.append(time, label, payload)
  messages.prepend(item)
}

const markDisconnected = (message: string) => {
  const changed = status.dataset.state !== 'idle'
  setStatus('已断开', 'idle')
  disconnectButton.disabled = true
  if (changed) {
    appendMessage(message)
  }
}

const handler: MsgHandler = {
  onAttentionChange: (message) => appendMessage('热度', message.body),
  onClose: () => markDisconnected('连接关闭'),
  onError: (error) => {
    setStatus('连接错误', 'error')
    appendMessage('连接错误', error.message)
  },
  onGift: (message) => appendMessage('礼物', message.body),
  onIncomeDanmu: (message) => appendMessage('弹幕', message.body),
  onIncomeSuperChat: (message) => appendMessage('醒目留言', message.body),
  onLiveEnd: (message) => appendMessage('直播结束', message.body),
  onLiveStart: (message) => appendMessage('直播开始', message.body),
  onOpen: () => {
    setStatus('已连接', 'live')
    disconnectButton.disabled = false
    appendMessage('连接建立')
  },
  onRoomInfoChange: (message) => appendMessage('房间信息', message.body),
  onStartListen: () => appendMessage('开始监听'),
  onUserAction: (message) => appendMessage('用户动态', message.body),
  onWatchedChange: (message) => appendMessage('观看人数', message.body),
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  listener?.close()

  const data = new FormData(form)
  let roomId = Number.parseInt(String(data.get('roomId') ?? ''), 10)
  let url = String(data.get('url') ?? '').trim()
  let key = String(data.get('key') ?? '').trim()
  const uid = Number.parseInt(String(data.get('uid') ?? '0'), 10) || 0
  let buvid = String(data.get('buvid') ?? '').trim()

  if (!(Number.isSafeInteger(roomId) && roomId > 0)) {
    setStatus('房间号无效', 'error')
    return
  }

  if (!(url && key)) {
    setStatus('获取节点中', 'connecting')
    const response = await fetch(`/api/connection?roomId=${roomId}`)
    const connection = (await response.json()) as {
      buvid?: string
      error?: string
      key?: string
      roomId?: number
      url?: string
    }
    if (!(response.ok && connection.key && connection.roomId && connection.url)) {
      setStatus('获取节点失败', 'error')
      appendMessage('连接信息错误', connection.error)
      return
    }
    key = connection.key
    roomId = connection.roomId
    url = connection.url
    buvid ||= connection.buvid ?? ''
  }

  setStatus('连接中', 'connecting')
  appendMessage('创建连接', { roomId, url })
  listener = startListen(roomId, handler, {
    ws: {
      ...(buvid ? { buvid } : {}),
      key,
      uid,
      url,
    },
  })
})

disconnectButton.addEventListener('click', () => {
  listener?.close()
  listener = undefined
  markDisconnected('主动断开')
})
clearButton.addEventListener('click', () => {
  messages.replaceChildren()
  messageCount = 0
  count.textContent = '0 条'
})
