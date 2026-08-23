import { getCachedInfo } from 'tiny-bilibili-ws'
import page from './index.html'

const port = Number.parseInt(Bun.env.PORT ?? '3000', 10)

const resolveConnection = async (requestedRoomId: number) => {
  const options = { headers: {} } as Parameters<typeof getCachedInfo>[1]
  const [room, danmu, buvid] = await getCachedInfo(requestedRoomId, options)
  const host = danmu.data.host_list[0]
  if (!host) {
    throw new Error('没有可用的弹幕服务器')
  }

  return {
    buvid,
    key: danmu.data.token,
    roomId: room.data.room_id,
    url: `wss://${host.host}:${host.wss_port}/sub`,
  }
}

const server = Bun.serve({
  development: true,
  fetch: async (request) => {
    const url = new URL(request.url)
    if (url.pathname !== '/api/connection') {
      return new Response('Not found', { status: 404 })
    }

    const roomId = Number.parseInt(url.searchParams.get('roomId') ?? '', 10)
    if (!(Number.isSafeInteger(roomId) && roomId > 0)) {
      return Response.json({ error: '房间号无效' }, { status: 400 })
    }

    try {
      return Response.json(await resolveConnection(roomId))
    } catch (error) {
      const message = error instanceof Error ? error.message : '连接信息获取失败'
      return Response.json({ error: message }, { status: 502 })
    }
  },
  port,
  routes: {
    '/': page,
  },
})

console.log(`Browser example: ${server.url}`)
