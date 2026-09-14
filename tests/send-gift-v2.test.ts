import { strict as assert } from 'node:assert'
import { EventEmitter } from 'node:events'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import protobuf from 'protobufjs'
import { listenAll } from '../src/listener'
import { SEND_GIFT, SEND_GIFT_V2 } from '../src/parser/SEND_GIFT'

// Fixtures contain anonymized decoded JSON only. Rebuild the relevant wire
// fields independently so this suite never needs private raw captures.
const capture = (name: string) => {
  if (name === 'normal') return { cmd: 'SEND_GIFT_V2', data: { pb: '[invalid_base64]' } }
  const data = JSON.parse(readFileSync(
    new URL(`../mock/SEND_GIFT_V2/decoded_${name}.json`, import.meta.url), 'utf8'))
  const writer = protobuf.Writer.create()
    .uint32(8).uint64(data.uid).uint32(18).string(data.uname)
    .uint32(26).string(data.face).uint32(40).uint32(data.guard_level ?? 0)
  for (const gift of data.gift_list) {
    writer.uint32(82).fork()
      .uint32(8).uint32(gift.gift_id).uint32(18).string(gift.gift_name)
      .uint32(24).uint32(gift.num).uint32(32).uint32(gift.gift_type)
      .uint32(40).uint64(gift.price).uint32(48).uint64(gift.field_6)
      .uint32(56).uint64(gift.total_coin).uint32(66).string(gift.coin_type)
      .uint32(74).string(gift.tid).uint32(80).uint32(gift.timestamp)
      .uint32(98).string(gift.rnd).ldelim()
  }
  return { cmd: 'SEND_GIFT_V2', data: { pb: Buffer.from(writer.finish()).toString('base64') } }
}
const attach = (handler: Parameters<typeof listenAll>[2]) => {
  const events = new EventEmitter()
  listenAll(events as unknown as Parameters<typeof listenAll>[0], 21452505, handler)
  return events
}

// Independently construct wire messages to exercise repeated gift items and
// non-unit quantities absent from our real captures. Do not export the schema.
const batch = () => {
  const writer = protobuf.Writer.create().uint32(8).uint64(123).uint32(18).string('sender')
  for (const [id, num, price, coin] of [[1, 2, 100, 'gold'], [2, 3, 200, 'silver']] as const) {
    writer.uint32(82).fork()
      .uint32(8).uint32(id).uint32(18).string(`gift${id}`)
      .uint32(24).uint32(num).uint32(40).uint64(price)
      .uint32(56).uint64(price * num).uint32(66).string(coin)
      .uint32(98).string('opaque-rnd').ldelim()
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
    assert.equal(gift.combo, undefined)
    assert.equal(gift.send_master, undefined)
    assert.equal(gift.user.badge, undefined)
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
