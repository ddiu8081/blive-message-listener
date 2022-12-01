import type { Message } from '../types/app'
import type { DanmuMsg } from '../parser'

type QueueItem = [number, string]
class MsgQueue {
	private items: QueueItem[] = []
	push = (item: QueueItem) => {
    this.items.push(item)
    if (this.items.length > 10) {
      this.items.shift()
    }
  }
  has = ( [timestamp, content]: QueueItem ) => {
    return this.items.some(i => {
      const [queueTimestamp, queueContent] = i
      return Math.abs(timestamp - queueTimestamp) < 1200 && content === queueContent
    })
  }
}

const msgQueue = new MsgQueue()

export const normalizeDanmu = <T>(msgType: string, body: T): Message<T> => {
  const timestamp = Date.now()
  const randomText = Math.floor(Math.random() * 10000).toString()
  // @ts-ignore
  const id = `${timestamp}:${msgType}:${body.user?.uid}:${randomText}`
  return {
    id,
    timestamp,
    type: msgType,
    body,
  }
}

export const checkIsDuplicateDanmuMsg = (msg: DanmuMsg) => {
  const msgIdentifier = `${msg.user.uid}:${msg.content}`
  const queueItem: QueueItem = [msg.timestamp, msgIdentifier]
  if (msgQueue.has(queueItem)) {
    return true
  }
  msgQueue.push(queueItem)
  return false
}