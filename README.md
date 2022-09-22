# blive-message-listener

[![npm](https://img.shields.io/npm/v/blive-message-listener)](https://www.npmjs.com/package/blive-message-listener)

Bilibili-live danmu listener with type.

Bilibili 直播间弹幕监听器，支持类型输出。

## Features

- 完整的类型支持

## Install

```bash

npm i blive-message-listener

```

## Usage

```ts
import { startListen, type MsgHandler } from 'blive-message-listener'

const handler: MsgHandler = {
  onIncomeDanmu: (msg) => {
    console.log(msg.id, msg.data)
  },
  onIncomeSuperChat: (msg) => {
    console.log(msg.id, msg.data)
  },
}

startListen(652581, handler)
```

Full type definition can be found in [src/parser](src/parser).

## Credits

- [bilibili-live-ws](https://github.com/simon300000/bilibili-live-ws)

## License

MIT
