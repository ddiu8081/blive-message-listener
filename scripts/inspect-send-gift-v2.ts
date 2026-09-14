import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import protobuf from 'protobufjs'
import { validateWire } from '../src/protobuf/validate'

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

// Names from the fuller schema posted in the PR comments, rather than the
// intentionally partial Python model (whose field 4/12 aliases differ).
const schemaSource = {
  url: 'https://github.com/xfgryujk/blivedm/pull/86',
  section: 'xfgryujk comment containing SendGiftBroadcast and GiftItem definitions',
  note: 'Community reverse-engineered protocol from PR comments; not an official schema.',
}

const names: Record<string, string> = {}
const addNames = (root: string, mapping: Record<string, string>) => {
  for (const [field, name] of Object.entries(mapping)) names[root ? `${root}.${field}` : field] = name
}
addNames('', {
  1: 'uid', 2: 'uname', 3: 'face', 4: 'name_color', 5: 'guard_level',
  6: 'svga_block', 7: 'send_master', 8: 'medal_info', 9: 'blind_gift',
  10: 'gift_list', 11: 'switch', 12: 'test', 13: 'wealth_info',
  14: 'group_medal', 15: 'sender_uinfo',
})
addNames('7', { 1: 'uid', 2: 'uname' })
addNames('8', {
  1: 'target_id', 2: 'special', 3: 'anchor_uname', 4: 'anchor_roomid',
  5: 'medal_level', 6: 'medal_name', 7: 'medal_color', 8: 'medal_color_start',
  9: 'medal_color_end', 10: 'medal_color_border', 11: 'is_lighted', 12: 'guard_level',
})
addNames('9', {
  1: 'blind_gift_config_id', 2: 'original_gift_id', 3: 'original_gift_name',
  4: 'from', 5: 'gift_action', 6: 'original_gift_price', 7: 'gift_tip_price',
})
addNames('10', {
  1: 'gift_id', 2: 'gift_name', 3: 'num', 4: 'demarcation', 5: 'price',
  6: 'discount_price', 7: 'total_coin', 8: 'coin_type', 9: 'tid', 10: 'timestamp',
  11: 'super_batch_gift_num', 12: 'batch_combo_id', 13: 'combo_resources_id',
  14: 'combo_total_coin', 15: 'combo_stay_time', 16: 'magnification',
  17: 'show_batch_combo_send', 18: 'action', 19: 'effect_block', 20: 'is_special_batch',
  21: 'float_sc_resource_id', 22: 'tag_image', 23: 'crit_prob', 24: 'rcost', 25: 'test',
  26: 'face_effect_type', 27: 'face_effect_id', 28: 'is_naming',
  29: 'receive_user_info', 30: 'is_join_receiver', 31: 'bag_gift', 32: 'gift_tag',
  33: 'receiver_uinfo', 34: 'face_effect_v2', 35: 'gift_info', 36: 'gift_tip_price',
  37: 'face_effect', 38: 'benefits', 39: 'effect_config',
})
addNames('10.29', { 1: 'uname', 2: 'uid' })
addNames('10.31', { 1: 'show_price', 2: 'price_for_show' })
addNames('10.35', { 1: 'img_basic' })
addNames('13', { 1: 'level' })
for (const root of ['15', '10.33']) {
  addNames(root, {
    1: 'uid', 2: 'base', 3: 'medal', 4: 'wealth', 5: 'title', 6: 'guard',
    7: 'uhead_frame', 8: 'guard_leader', 9: 'anon',
  })
  addNames(`${root}.2`, {
    1: 'name', 2: 'face', 3: 'name_color', 4: 'is_mystery',
    5: 'risk_ctrl_info', 6: 'origin_info', 7: 'official_info', 8: 'name_color_str',
  })
  addNames(`${root}.2.6`, { 1: 'name', 2: 'face' })
  addNames(`${root}.3`, {
    1: 'name', 2: 'level', 3: 'color_start', 4: 'color_end', 5: 'color_border',
    6: 'color', 7: 'id', 8: 'typ', 9: 'is_light', 10: 'ruid', 11: 'guard_level',
    12: 'score', 13: 'guard_icon', 14: 'honor_icon', 15: 'v2_medal_color_start',
    16: 'v2_medal_color_end', 17: 'v2_medal_color_border', 18: 'v2_medal_color_text',
    19: 'v2_medal_color_level', 20: 'user_receive_count',
  })
  addNames(`${root}.4`, { 1: 'level', 2: 'dm_icon_key' })
  addNames(`${root}.6`, { 1: 'level', 2: 'expired_str' })
}
const hints = Object.fromEntries(Object.entries(names).map(([path, name]) =>
  [path, `${name} (blivedm PR #86 protocol comment)`]))

// These paths were non-empty nested messages in captured samples. Explicitly
// recognize their empty representation instead of treating it as an empty string.
const messagePaths = new Set(['7', '8', '9', '10', '10.29', '10.33', '10.34',
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
      : key === '10.16' ? field.float32
        : field.float32 !== undefined
        ? { fixed32: field.value, float32_candidate: field.float32 }
        : field.value)
    return [names[key] ?? `field_${number}`, key === '10' || values.length > 1 ? values : values[0]]
  }))
}

/** Lossless integer values; field numbers/repeated fields survive inspection. */
export function inspectWire(bytes: Uint8Array, path = '', depth = 0): WireField[] {
  if (depth > 32) throw new Error('Message nesting exceeds inspection limit')
  validateWire(bytes)
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
    note: 'Fields marked PR #86 use its community protocol comment; other hints and unknown length-delimited interpretations remain inferred. Integers are unsigned decimal strings.',
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
          note: 'Named view using the full protocol in blivedm PR #86 comments, not the legacy SEND_GIFT schema. Integers remain strings; field_N and candidate fields have unconfirmed semantics. Missing fields are not filled with defaults. gift_list is always an array; field 12 is batch_combo_id, not the partial Python model alias rnd.',
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
