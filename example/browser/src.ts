import { startListen } from 'blive-message-listener/browser'
import type { MsgHandler } from 'blive-message-listener'

const logDom = document.getElementById('log')

const handler: MsgHandler = {
  onStartListen: () => {
    console.log('start listen')
    logDom!.innerHTML += 'start listen<br>'
  },
  onIncomeDanmu: (msg) => {
    console.log(msg)
    logDom!.innerHTML += `${JSON.stringify(msg.body)}<br>`
  },
  raw: {
    'INTERACT_WORD': (msg) => {
      console.log(msg)
      logDom!.innerHTML += `${JSON.stringify(msg)}<br>`
    },
  }
}

startListen(652581, handler)
