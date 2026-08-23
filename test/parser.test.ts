import { describe, expect, test } from 'bun:test'
import { DANMU_MSG, INTERACT_WORD, SEND_GIFT, WATCHED_CHANGE } from '../src/parser/index.ts'
import { intToColorHex } from '../src/utils/color.ts'
import { normalizeDanmu } from '../src/utils/message.ts'
import { readMock } from './helpers.ts'

describe('parser fixtures', () => {
  test('parses a normal danmu with its public user and emoticon fields', async () => {
    const raw = await readMock<any>('DANMU_MSG/emoticon_normal.json')
    const parsed = DANMU_MSG.parser(raw, 77_777_777_774)

    expect(parsed).not.toBeNull()
    expect(parsed?.content).toBe('赞')
    expect(parsed?.content_color).toBe('#ffffff')
    expect(parsed?.user.uid).toBe(77_777_777_771)
    expect(parsed?.user.badge).toBeUndefined()
    expect(parsed?.emoticon?.id).toBe('official_147')
  })

  test('parses a user entrance and resolves whether its badge belongs to the room', async () => {
    const raw = await readMock<any>('INTERACT_WORD/enter.json')
    const parsed = INTERACT_WORD.parser(raw, 77_777_777_773)

    expect(parsed?.action).toBe('enter')
    expect(parsed?.user.uname).toBe('__MOCK_UNAME__')
    expect(parsed?.user.badge?.anchor.is_same_room).toBeTrue()
    expect(parsed?.timestamp).toBe(1_661_528_426_688)
  })

  test('ignores an incomplete user action payload instead of throwing', () => {
    expect(INTERACT_WORD.parser({ cmd: 'INTERACT_WORD' }, 1)).toBeNull()
  })

  test('parses gifts without inventing an empty badge or combo', async () => {
    const raw = await readMock<any>('SEND_GIFT/辣条_no_badge.json')
    const parsed = SEND_GIFT.parser(raw)

    expect(parsed.gift_name).toBe('辣条')
    expect(parsed.amount).toBe(1)
    expect(parsed.user.badge).toBeUndefined()
    expect(parsed.combo).toBeUndefined()
  })

  test('preserves numeric and formatted watched counts', async () => {
    const raw = await readMock<any>('WATCHED_CHANGE/120k.json')
    expect(WATCHED_CHANGE.parser(raw)).toEqual({ num: 120_457, text_small: '12.0万' })
  })
})

describe('normalization helpers', () => {
  test('converts Bilibili integer colors to padded CSS colors', () => {
    expect(intToColorHex()).toBe('#000000')
    expect(intToColorHex(255)).toBe('#0000ff')
    expect(intToColorHex(16_777_215)).toBe('#ffffff')
  })

  test('wraps a parsed body with stable message metadata', () => {
    const body = { user: { uid: 42 } }
    const raw = { cmd: 'TEST' }
    const message = normalizeDanmu('TEST', body, raw)

    expect(message.type).toBe('TEST')
    expect(message.body).toBe(body)
    expect(message.raw).toBe(raw)
    expect(message.timestamp).toBeGreaterThan(0)
    expect(message.id).toContain(`:TEST:${body.user.uid}:`)
  })
})
