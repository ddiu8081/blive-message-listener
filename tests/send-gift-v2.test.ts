import { strict as assert } from 'node:assert'
import { EventEmitter } from 'node:events'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import protobuf from 'protobufjs'
import { listenAll } from '../src/listener'
import { SEND_GIFT, SEND_GIFT_V2 } from '../src/parser/SEND_GIFT'
import { decode } from '../src/protobuf/SEND_GIFT_V2.proto'
import { inspectSendGiftV2, namedFields } from '../scripts/inspect-send-gift-v2'

// Fixtures contain anonymized decoded JSON only. Rebuild the relevant wire
// fields independently so this suite never needs private raw captures.
const capture = (name: string) => {
  if (name === 'normal') return { cmd: 'SEND_GIFT_V2', data: { pb: '[invalid_base64]' } }
  const data = JSON.parse(readFileSync(
    new URL(`../mock/SEND_GIFT_V2/decoded_${name}.json`, import.meta.url), 'utf8'))
  const writer = protobuf.Writer.create()
    .uint32(8).uint64(data.uid).uint32(18).string(data.uname)
    .uint32(26).string(data.face).uint32(40).uint32(data.guard_level ?? 0)
    .uint32(88).bool(Boolean(data.switch))
  writer.uint32(66).fork()
  for (const [id, key] of [[1, 'target_id'], [4, 'anchor_roomid'], [5, 'medal_level'],
    [7, 'medal_color'], [8, 'medal_color_start'], [9, 'medal_color_end'],
    [10, 'medal_color_border'], [11, 'is_lighted'], [12, 'guard_level']] as const) {
    if (data.medal_info[key] !== undefined) writer.uint32(id * 8).int64(data.medal_info[key])
  }
  for (const [id, key] of [[3, 'anchor_uname'], [6, 'medal_name']] as const) {
    if (data.medal_info[key] !== undefined) writer.uint32(id * 8 + 2).string(data.medal_info[key])
  }
  writer.ldelim()
  if (data.blind_gift) {
    writer.uint32(74).fork().uint32(26).string(data.blind_gift.original_gift_name)
      .uint32(48).int64(data.blind_gift.original_gift_price).ldelim()
  }
  for (const gift of data.gift_list) {
    writer.uint32(82).fork()
      .uint32(8).uint32(gift.gift_id).uint32(18).string(gift.gift_name)
      .uint32(24).uint32(gift.num).uint32(32).uint32(gift.demarcation)
      .uint32(40).uint64(gift.price).uint32(48).uint64(gift.discount_price)
      .uint32(56).uint64(gift.total_coin).uint32(66).string(gift.coin_type)
      .uint32(74).string(gift.tid).uint32(80).uint32(gift.timestamp)
      .uint32(88).int64(gift.super_batch_gift_num)
      .uint32(98).string(gift.batch_combo_id)
      .uint32(112).int64(gift.combo_total_coin)
      .uint32(133).float(gift.magnification).ldelim()
  }
  return { cmd: 'SEND_GIFT_V2', data: { pb: Buffer.from(writer.finish()).toString('base64') } }
}
const attach = (handler: Parameters<typeof listenAll>[2]) => {
  const events = new EventEmitter()
  listenAll(events as unknown as Parameters<typeof listenAll>[0], 77777777774, handler)
  return events
}

// Independently construct wire messages to exercise repeated gift items and
// non-unit quantities absent from our real captures. Do not export the schema.
const batch = (enabled: boolean | null = true) => {
  const writer = protobuf.Writer.create().uint32(8).uint64(123).uint32(18).string('sender')
  if (enabled !== null) writer.uint32(88).bool(enabled)
  for (const [id, num, price, coin] of [[1, 2, 100, 'gold'], [2, 3, 200, 'silver']] as const) {
    writer.uint32(82).fork()
      .uint32(8).uint32(id).uint32(18).string(`gift${id}`)
      .uint32(24).uint32(num).uint32(40).uint64(price)
      .uint32(56).uint64(price * num).uint32(66).string(coin)
      .uint32(88).int64(num + 5).uint32(98).string(`batch-${id}`)
      .uint32(112).int64(price * (num + 5)).ldelim()
  }
  return { cmd: 'SEND_GIFT_V2', data: { dmscore: 952, pb: Buffer.from(writer.finish()).toString('base64') } }
}

test('five anonymized capture fixtures reuse the legacy gift shape', () => {
  for (let i = 2; i <= 6; i++) {
    const [gift, ...rest] = SEND_GIFT_V2.parser(capture(`normal${i}`))
    assert.equal(rest.length, 0)
    assert.equal(gift.user.uid, 77777777771)
    assert.equal(gift.user.uname, '__MOCK_UNAME__')
    assert.equal(gift.user.face, 'http://__MOCK_FACE__.jpg')
    assert.equal(gift.user.identity?.guard_level, i === 3 ? 3 : 0)
    assert.equal(gift.gift_id, i === 6 ? 35208 : 31164)
    assert.equal(gift.gift_name, i === 6 ? '星光铃铛' : '粉丝团灯牌')
    assert.equal(gift.price, i === 6 ? 5200 : 100)
    assert.equal(gift.amount, 1)
    assert.equal(gift.coin_type, 'gold')
    assert.deepEqual(gift.combo, {
      batch_id: `__MOCK_BATCH_COMBO_ID_${i}__`, combo_num: 1,
      total_price: i === 6 ? 5200 : 100,
    })
    assert.equal(gift.send_master, undefined)
    if (i === 6) assert.equal(gift.user.badge, undefined)
    else {
      assert.equal(gift.user.badge?.name, '__MOCK_BADGE_NAME__')
      assert.equal(gift.user.badge?.level, [34, 22, 34, 6][i - 2])
      assert.equal(gift.user.badge?.active, i !== 5)
      assert.equal(gift.user.badge?.anchor.uid, 77777777772)
      assert.equal(gift.user.badge?.anchor.room_id, 0)
    }
  }
})

test('onGift emits every item in order; raw callback runs once with unchanged broadcast', () => {
  const message = batch()
  const bodies: any[] = []
  let rawCalls = 0
  const events = attach({
    raw: { SEND_GIFT_V2: raw => { rawCalls++; assert.equal(raw, message) } },
    onGift: gift => {
      assert.equal(rawCalls, 1)
      assert.equal(gift.type, 'SEND_GIFT_V2')
      assert.equal(gift.raw, message)
      assert.equal(gift.raw.data.dmscore, 952)
      bodies.push(gift.body)
    },
  })
  events.emit('SEND_GIFT_V2', { data: message })
  assert.equal(rawCalls, 1)
  assert.deepEqual(bodies.map(g => [g.gift_id, g.amount, g.price, g.coin_type]),
    [[1, 2, 100, 'gold'], [2, 3, 200, 'silver']])
  assert.deepEqual(bodies.map(g => g.combo), [
    { batch_id: 'batch-1', combo_num: 7, total_price: 700 },
    { batch_id: 'batch-2', combo_num: 8, total_price: 1600 },
  ])
})

test('medal colors retain ordering; blind-gift paid total is distinct from price and combo total', () => {
  const gift = SEND_GIFT_V2.parser(capture('normal2'))[0]
  assert.equal(gift.user.badge?.color, '#7a0423')
  assert.deepEqual(gift.user.badge?.gradient, ['#7a0423', '#7a0423', '#e986bb'])
  const blind = decode(capture('normal6').data.pb)
  const item = blind.gift_list[0]
  assert.equal(item.demarcation, 2)
  assert.equal(item.price, 5200)
  assert.equal(item.discount_price, 5200)
  assert.equal(item.total_coin, 5000)
  assert.equal(item.combo_total_coin, 5200)
  assert.equal(item.magnification, 1)
  assert.equal(blind.blind_gift?.original_gift_price, 5000)
})

test('inspection uses protocol names instead of partial-model aliases', () => {
  const data = namedFields(inspectSendGiftV2(capture('normal6')).fields) as any
  const gift = data.gift_list[0]
  assert.equal(gift.demarcation, '2')
  assert.equal(gift.batch_combo_id, '__MOCK_BATCH_COMBO_ID_6__')
  assert.equal(gift.combo_total_coin, '5200')
  assert.equal(gift.magnification, 1)
  assert.equal(gift.rnd, undefined)
  assert.equal(gift.gift_type, undefined)
})

test('top-level send_master is decoded without fabricating a room_id', () => {
  const prefix = protobuf.Writer.create().uint32(58).fork()
    .uint32(8).int64(77777777775).uint32(18).string('__MOCK_MASTER_UNAME__').ldelim().finish()
  const message = batch()
  message.data.pb = Buffer.concat([prefix, Buffer.from(message.data.pb, 'base64')]).toString('base64')
  assert.deepEqual(decode(message.data.pb).send_master, { uid: 77777777775, uname: '__MOCK_MASTER_UNAME__' })
  assert.equal(SEND_GIFT_V2.parser(message)[0].send_master, undefined)
})

test('legacy and V2 both dispatch through onGift; legacy badge and combo remain intact', () => {
  const legacy = JSON.parse(readFileSync(new URL('../mock/SEND_GIFT/粉丝团灯牌.json', import.meta.url), 'utf8'))
  const received: any[] = []
  const events = attach({ onGift: gift => received.push(gift) })
  events.emit('SEND_GIFT', { data: legacy })
  events.emit('SEND_GIFT_V2', { data: capture('normal2') })
  assert.deepEqual(received.map(g => g.type), ['SEND_GIFT', 'SEND_GIFT_V2'])
  assert.deepEqual(received[0].body, SEND_GIFT.parser(legacy))
  assert.equal(received[0].body.user.badge.level, 9)
  assert.equal(received[0].body.combo.total_price, 1000)
})

test('missing and empty payloads are skipped; malformed payload reports error and later messages work', () => {
  let errors = 0
  let gifts = 0
  const events = attach({ onError: () => errors++, onGift: () => gifts++ })
  for (const pb of [undefined, '', 'CA==']) {
    events.emit('SEND_GIFT_V2', { data: { cmd: 'SEND_GIFT_V2', data: { pb } } })
  }
  events.emit('SEND_GIFT_V2', { data: capture('normal') })
  assert.equal(errors, 2)
  assert.equal(gifts, 0)
  events.emit('SEND_GIFT_V2', { data: capture('normal6') })
  assert.equal(gifts, 1)
  assert.deepEqual(SEND_GIFT_V2.parser({ data: { pb: 'CAE=' } }), [])
})

test('raw-only V2 registration does not decode invalid PB or subscribe to legacy gifts', () => {
  let calls = 0
  const events = attach({ raw: { SEND_GIFT_V2: () => calls++ }, onError: () => assert.fail('must not decode') })
  events.emit('SEND_GIFT_V2', { data: capture('normal') })
  assert.equal(calls, 1)
  assert.equal(events.listenerCount('SEND_GIFT_V2'), 1)
  assert.equal(events.listenerCount('SEND_GIFT'), 0)
})

test('user callback errors are not misreported as decoding errors', () => {
  const failure = new Error('application failure')
  const events = attach({ onGift: () => { throw failure }, onError: () => assert.fail('not a decoding error') })
  assert.throws(() => events.emit('SEND_GIFT_V2', { data: capture('normal2') }), error => error === failure)
})

test('disabled or missing switch and empty gift lists emit no gifts but retain raw messages', () => {
  let raw = 0
  let gifts = 0
  const events = attach({ raw: { SEND_GIFT_V2: () => raw++ }, onGift: () => gifts++ })
  for (const message of [batch(false), batch(null), { data: { pb: 'WAE=' } }]) {
    events.emit('SEND_GIFT_V2', { data: message })
  }
  assert.equal(raw, 3)
  assert.equal(gifts, 0)
})

test('anonymous identities and four unknown wire types do not break gifts', () => {
  const message = batch()
  const extra = protobuf.Writer.create().uint32(8).int64(0).uint32(18).string('__MOCK_ANONYMOUS__')
    .uint32(122).fork().uint32(74).fork().uint32(18).string('synthetic-encrypted-identity').ldelim().ldelim()
    .uint32(300 * 8).uint64(1).uint32(301 * 8 + 1).fixed64(0)
    .uint32(302 * 8 + 2).bytes(Uint8Array.from([255]))
    .uint32(303 * 8 + 5).fixed32(0).finish()
  message.data.pb = Buffer.concat([Buffer.from(message.data.pb, 'base64'), extra]).toString('base64')
  const gifts = SEND_GIFT_V2.parser(message)
  assert.equal(gifts.length, 2)
  assert.equal(gifts[0].user.uid, 0)
  assert.equal(gifts[0].user.uname, '__MOCK_ANONYMOUS__')
})

test('oversized tags and varints are rejected before protobufjs can truncate them', () => {
  const overflow = [...Array(9).fill(0x80), 0x02]
  for (const suffix of [
    [0x88, 0x80, 0x80, 0x80, 0x80, 0x01, 0x2a], // field 2^32+1
    [8, ...overflow], // uid
    [82, 11, 112, ...overflow], // nested gift combo_total_coin
    [82, 13, 0x82, 0x02, 10, ...overflow], // packed gift_tag
  ]) {
    const message = batch()
    message.data.pb = Buffer.concat([Buffer.from(message.data.pb, 'base64'), Buffer.from(suffix)]).toString('base64')
    assert.throws(() => decode(message.data.pb), /field number|64 bits/)
  }
  // A valid ten-byte int64 -1 is not overflow (same edge case as PR #805).
  const bytes = Buffer.from([8, ...Array(9).fill(0xff), 1])
  assert.equal(decode(bytes.toString('base64')).uid, -1)
})
