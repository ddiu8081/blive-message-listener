import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import protobuf from 'protobufjs'

interface WireField {
  field: number
  wireType: number
  /** Inferred from captured values, not an authoritative schema. */
  hint?: string
  interpretation?: 'utf8' | 'message' | 'hex'
  value: string | number | WireField[]
  /** A fixed32 may also represent a float; preserve both interpretations. */
  float32?: number | string
}

// Hints describe evidence only. Equal values do not establish field semantics.
const hints: Record<string, string> = {
  '1': 'uid',
  '2': 'uname',
  '3': 'face',
  '4': 'name_color',
  '5': 'possibly guard_level',
  '8': 'medal_info (can differ from uinfo.medal_info or be empty)',
  '8.1': 'medal anchor uid',
  '8.5': 'medal_level',
  '8.6': 'medal_name',
  '8.7': 'color (ordering unconfirmed)',
  '8.8': 'color (ordering unconfirmed)',
  '8.9': 'color (ordering unconfirmed)',
  '8.10': 'color (ordering unconfirmed)',
  '8.11': 'possibly is_lighted',
  '8.12': 'possibly medal guard_level',
  '9': 'blind_gift candidate (normal6 contains 幸运盲盒 / 爆出)',
  '9.1': 'blind gift configuration/id candidate',
  '9.2': 'original gift id candidate',
  '9.3': 'original gift name',
  '9.5': 'blind gift action',
  '9.6': 'original gift price candidate; equals 10.7 in normal6',
  '10': 'gift information',
  '10.1': 'giftId',
  '10.2': 'giftName',
  '10.3': 'num candidate; 1 in every capture, no multi-quantity evidence',
  '10.4': 'giftType candidate; 1 for 粉丝团灯牌, 2 for blind-gift 星光铃铛',
  '10.5': 'amount/price candidate (unconfirmed)',
  '10.6': 'amount/price candidate (unconfirmed)',
  '10.7': 'payment/discount-price candidate; 5000 vs 5200 in normal6, equals 9.6',
  '10.8': 'coin_type',
  '10.9': 'transaction identifier string',
  '10.10': 'timestamp (seconds)',
  '10.11': 'quantity/flag candidate (unconfirmed)',
  '10.12': 'batch_combo_id',
  '10.14': 'amount/price candidate (unconfirmed)',
  '10.18': 'action',
  '10.29': 'recipient information; not confirmed as send_master',
  '10.29.1': 'recipient uname',
  '10.29.2': 'recipient uid',
  '10.33': 'recipient uinfo',
  '10.36': 'blind-gift amount candidate; 5200 in normal6 only',
  '13': 'possibly wealth information',
  '15': 'sender uinfo (matches INTERACT_WORD_V2 UserInfo layout)',
  '15.1': 'uid',
  '15.2': 'base',
  '15.2.1': 'uname',
  '15.2.2': 'face',
  '15.3': 'medal_info',
  '15.3.1': 'medal_name',
  '15.3.2': 'medal_level',
  '15.3.10': 'ruid',
}

const schemaSource = {
  url: 'https://github.com/xfgryujk/blivedm/pull/86',
  commit: 'dcd99f0d1bafe44210c0dffc785eaea635705e26',
  file: 'blivedm/models/pb.py',
  note: 'Community reverse-engineered schema from the final PR revision; not an official Bilibili schema.',
}

// Prefer the final merged PR over its initial description: total_coin moved
// to field 7, and field 10 is repeated (one broadcast can contain many gifts).
const prNames: Record<string, string> = {
  '1': 'uid', '2': 'uname', '3': 'face', '5': 'guard_level',
  '8': 'medal_info', '8.1': 'target_id', '8.4': 'anchor_roomid',
  '8.5': 'medal_level', '8.6': 'medal_name',
  '9': 'blind_gift', '9.3': 'original_gift_name', '9.6': 'original_gift_price',
  '10': 'gift_list', '10.1': 'gift_id', '10.2': 'gift_name',
  '10.3': 'num', '10.4': 'gift_type', '10.5': 'price',
  '10.7': 'total_coin', '10.8': 'coin_type', '10.9': 'tid',
  '10.10': 'timestamp', '10.12': 'rnd', '10.18': 'action',
  '10.35': 'gift_info', '10.35.1': 'img_basic',
}
for (const [path, name] of Object.entries(prNames)) {
  hints[path] = `${name} (blivedm PR #86 final schema)`
}

// Descriptive names only where supported by visible content. Unknown scalars
// retain field_N keys; candidates are explicitly named as candidates.
const names: Record<string, string> = {
  '1': 'uid', '2': 'uname', '3': 'face', '4': 'name_color',
  '5': 'guard_level_candidate', '8': 'medal_info', '9': 'blind_gift_candidate',
  '8.1': 'target_id', '8.5': 'medal_level', '8.6': 'medal_name',
  '9.2': 'original_gift_id_candidate', '9.3': 'original_gift_name',
  '9.5': 'action', '9.6': 'original_gift_price_candidate',
  '10': 'gift', '10.1': 'giftId', '10.2': 'giftName',
  '10.3': 'num_candidate', '10.4': 'giftType_candidate',
  '10.8': 'coin_type', '10.9': 'transaction_id', '10.10': 'timestamp',
  '10.12': 'batch_combo_id', '10.18': 'action', '10.29': 'recipient',
  '10.29.1': 'uname', '10.29.2': 'uid', '10.33': 'recipient_uinfo',
  '13': 'wealth_candidate', '13.1': 'level_candidate', '15': 'uinfo',
}
Object.assign(names, prNames)
for (const root of ['15', '10.33']) {
  for (const [suffix, name] of Object.entries({
    '1': 'uid', '2': 'base', '2.1': 'uname', '2.2': 'face',
    '2.6': 'origin_info', '2.6.1': 'name', '2.6.2': 'face',
    '3': 'medal_info', '3.1': 'medal_name', '3.2': 'medal_level',
    '3.3': 'color_start', '3.4': 'color_end', '3.5': 'color_border',
    '3.6': 'color', '3.9': 'is_lighted', '3.10': 'ruid',
    '3.11': 'guard_level', '3.12': 'score', '3.13': 'guard_icon',
    '3.15': 'v2_medal_color_start', '3.16': 'v2_medal_color_end',
    '3.17': 'v2_medal_color_border', '3.18': 'v2_medal_color_text',
    '3.19': 'v2_medal_color_level',
  })) names[`${root}.${suffix}`] = name
}

// These paths were non-empty nested messages in captured samples. Explicitly
// recognize their empty representation instead of treating it as an empty string.
const messagePaths = new Set(['8', '9', '10', '10.29', '10.33', '10.34',
  '10.35', '10.37', '13', '15', '15.2', '15.3', '15.2.6',
  '10.33.2', '10.33.2.6'])

export function namedFields(fields: WireField[], path = ''): Record<string, unknown> {
  const groups = new Map<number, WireField[]>()
  for (const field of fields) {
    const group = groups.get(field.field) ?? []
    group.push(field)
    groups.set(field.field, group)
  }
  return Object.fromEntries([...groups].map(([number, group]) => {
    const key = path ? `${path}.${number}` : String(number)
    const values = group.map(field => Array.isArray(field.value)
      ? namedFields(field.value, key)
      : field.float32 !== undefined
        ? { fixed32: field.value, float32_candidate: field.float32 }
        : field.value)
    return [names[key] ?? `field_${number}`, key === '10' || values.length > 1 ? values : values[0]]
  }))
}

/** Lossless integer values; field numbers/repeated fields survive inspection. */
export function inspectWire(bytes: Uint8Array, path = '', depth = 0): WireField[] {
  if (depth > 32) throw new Error('Message nesting exceeds inspection limit')
  const reader = protobuf.Reader.create(bytes)
  const fields: WireField[] = []
  while (reader.pos < reader.len) {
    const tag = reader.uint32()
    const field = tag >>> 3
    const wireType = tag & 7
    if (field === 0) throw new Error('Invalid protobuf field number 0')
    const key = path ? `${path}.${field}` : String(field)
    const item: WireField = { field, wireType, value: '' }
    if (hints[key]) item.hint = hints[key]
    switch (wireType) {
      case 0:
        // Wire format alone cannot distinguish signed ints, unsigned ints,
        // zigzag ints, enums and booleans. Record unsigned decimal text.
        item.value = reader.uint64().toString()
        break
      case 1:
        item.value = reader.fixed64().toString()
        break
      case 2: {
        const value = reader.bytes()
        if (messagePaths.has(key)) {
          item.value = inspectWire(value, key, depth + 1)
          item.interpretation = 'message'
          break
        }
        try {
          const text = new TextDecoder('utf-8', { fatal: true }).decode(value)
          if (/[\u0000-\u001f\u007f-\u009f]/u.test(text)) throw new Error('Binary data')
          item.value = text
          item.interpretation = 'utf8'
        } catch {
          try {
            item.value = inspectWire(value, key, depth + 1)
            item.interpretation = 'message'
          } catch {
            item.value = Buffer.from(value).toString('hex')
            item.interpretation = 'hex'
          }
        }
        // String vs nested message vs packed data is heuristic without a schema.
        break
      }
      case 5: {
        item.value = reader.fixed32()
        const buffer = new ArrayBuffer(4)
        const view = new DataView(buffer)
        view.setUint32(0, item.value, true)
        const float = view.getFloat32(0, true)
        item.float32 = Number.isFinite(float) ? float : String(float)
        break
      }
      default:
        throw new Error(`Unsupported wire type ${wireType} at ${key}`)
    }
    fields.push(item)
  }
  return fields
}

export function inspectSendGiftV2(message: { cmd?: string, data?: { pb?: string, dmscore?: number } }) {
  if (message.cmd !== 'SEND_GIFT_V2') throw new Error('Expected SEND_GIFT_V2')
  const base64 = message.data?.pb
  if (typeof base64 !== 'string' || !base64 || base64.length % 4 === 1 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
    throw new Error('Missing or invalid Base64 pb (placeholder samples cannot be decoded)')
  }
  const bytes = Buffer.from(base64, 'base64')
  if (bytes.toString('base64').replace(/=+$/, '') !== base64.replace(/=+$/, '')) {
    throw new Error('Non-canonical Base64 pb')
  }
  return {
    cmd: message.cmd,
    dmscore: message.data?.dmscore,
    byteLength: bytes.length,
    note: 'Fields marked PR #86 use its final community schema; other hints and unknown length-delimited interpretations remain inferred. Integers are unsigned decimal strings.',
    schemaSource,
    fields: inspectWire(bytes),
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const files = process.argv.slice(2)
  let outputDir: string | undefined
  if (files[0] === '--out-dir') {
    files.shift()
    outputDir = files.shift()
    if (!outputDir || outputDir.startsWith('--')) throw new Error('Expected output directory')
  }
  if (!files.length) {
    console.error('Usage: bun scripts/inspect-send-gift-v2.ts [--out-dir <directory>] <capture.json> [...]')
    process.exitCode = 1
  } else {
    const results = files.map(file => {
      try {
        return { file, ...inspectSendGiftV2(JSON.parse(readFileSync(file, 'utf8'))) }
      } catch (error) {
        process.exitCode = 1
        return { file, error: error instanceof Error ? error.message : String(error) }
      }
    })
    if (outputDir) {
      const stems = files.map(file => basename(file).replace(/\.json$/i, ''))
      if (new Set(stems).size !== stems.length) throw new Error('Duplicate output basenames')
      mkdirSync(outputDir, { recursive: true })
      const save = (name: string, data: unknown) => writeFileSync(
        resolve(outputDir!, name), `${JSON.stringify(data, null, 2)}\n`)
      save('decoded.json', results)
      for (const [index, result] of results.entries()) {
        if (!('fields' in result)) continue
        save(`${stems[index]}.wire.json`, result)
        save(`${stems[index]}.parsed.json`, {
          source: result.file, cmd: result.cmd, dmscore: result.dmscore,
          note: 'Named view using blivedm PR #86 plus exploratory hints, not the legacy SEND_GIFT schema. Integers remain strings; field_N and candidate fields have unconfirmed semantics. Missing fields are not filled with defaults. gift_list is always an array; rnd is not assumed to be a batch_combo_id.',
          schemaSource,
          data: namedFields(result.fields),
          fieldNames: names,
          fieldHints: hints,
        })
      }
      console.log(`Wrote inspection results to ${outputDir}`)
    } else console.log(JSON.stringify(results, null, 2))
  }
}
