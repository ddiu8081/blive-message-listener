import { startListen, type MsgHandler } from 'blive-message-listener'

const handler: MsgHandler = {
  onStartListen: () => {
    console.log('start listen')
  },
  onIncomeDanmu: (msg) => {
    console.log(msg)
  },
  raw: {
    INTERACT_WORD: (msg) => {
      console.log(msg)
    },
  },
}

startListen(652581, handler, {
  ws: {
    headers: {
      Cookie: 'LIVE_BUVID=xxx; buvid3=xxx; xxx',
    },
    uid: 541993,
  },
})
