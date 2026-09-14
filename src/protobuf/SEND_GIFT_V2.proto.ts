import protobuf from 'protobufjs'

// Field numbers from the final blivedm PR #86 schema:
// https://github.com/hqrrr/blivedm/blob/dcd99f0d1bafe44210c0dffc785eaea635705e26/blivedm/models/pb.py
// Only fields used by our existing GiftMsg are decoded. Unknown fields are skipped.
const root = protobuf.Root.fromJSON({
  nested: {
    SendGiftV2: {
      fields: {
        uid: { type: 'uint64', id: 1 },
        uname: { type: 'string', id: 2 },
        face: { type: 'string', id: 3 },
        guard_level: { type: 'uint32', id: 5 },
        gift_list: { rule: 'repeated', type: 'GiftItem', id: 10 },
      },
      nested: {
        GiftItem: {
          fields: {
            gift_id: { type: 'uint32', id: 1 },
            gift_name: { type: 'string', id: 2 },
            num: { type: 'uint32', id: 3 },
            price: { type: 'uint64', id: 5 },
            coin_type: { type: 'string', id: 8 },
          },
        },
      },
    },
  },
})

interface GiftItem {
  gift_id: number
  gift_name: string
  num: number
  price: number
  coin_type: 'silver' | 'gold'
}

export interface SendGiftV2 {
  uid: number
  uname: string
  face: string
  guard_level: number
  gift_list: GiftItem[]
}

const messageType = root.lookupType('SendGiftV2')

export const decode = (base64Data: string): SendGiftV2 => {
  if (typeof base64Data !== 'string') throw new TypeError('SEND_GIFT_V2 pb must be a Base64 string')
  // atob/Uint8Array also work in the browser entry point; no Node Buffer required.
  const bytes = Uint8Array.from(atob(base64Data), char => char.charCodeAt(0))
  const data = messageType.toObject(messageType.decode(bytes), {
    longs: Number,
    defaults: true,
    arrays: true,
  }) as SendGiftV2
  if (!Number.isSafeInteger(data.uid)) throw new RangeError('SEND_GIFT_V2 uid exceeds safe integer range')
  for (const gift of data.gift_list) {
    if (!Number.isSafeInteger(gift.price)) throw new RangeError('SEND_GIFT_V2 price exceeds safe integer range')
    if (gift.coin_type !== 'gold' && gift.coin_type !== 'silver') {
      throw new Error(`Unsupported SEND_GIFT_V2 coin_type: ${gift.coin_type}`)
    }
  }
  return data
}
