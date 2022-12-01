import { startListen, type MsgHandler } from '../dist/index'

const handler: MsgHandler = {
  onStartListen: () => {
    console.log('start listen')
  },
  onIncomeDanmu: (msg) => {
    console.log(msg)
  },
  raw: {
    'INTERACT_WORD': (msg) => {
      console.log(msg)
    },
  }
}

startListen(652581, handler)
