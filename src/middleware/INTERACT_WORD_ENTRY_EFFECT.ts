import type { Message } from '../types/app'
import type { UserActionMsg } from '../parser'

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

export const checkIsDuplicateDanmuMsg = (msg: UserActionMsg) => {
  const msgIdentifier = `${msg.user.uid}:${msg.content}`
  const queueItem: QueueItem = [msg.timestamp, msgIdentifier]
  if (msgQueue.has(queueItem)) {
    return true
  }
  msgQueue.push(queueItem)
  return false
}

export const deduplicateSend = (msg: Message) => {}