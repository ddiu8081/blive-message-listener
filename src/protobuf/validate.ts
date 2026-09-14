import protobuf from 'protobufjs'

// protobufjs can silently truncate an overflowing varint before toObject runs.
// Validate wire boundaries before decoding; opaque unknown bytes stay opaque.
export function validateWire(bytes: Uint8Array, type?: protobuf.Type, depth = 0): void {
  if (depth > 64) throw new Error('Protobuf nesting limit exceeded')
  let offset = 0
  const varint = (): bigint => {
    let value = 0n
    for (let index = 0; index < 10; index++) {
      if (offset >= bytes.length) throw new Error('Truncated protobuf varint')
      const byte = bytes[offset++]
      if (index === 9 && byte > 1) throw new Error('Protobuf varint exceeds 64 bits')
      value |= BigInt(byte & 127) << BigInt(index * 7)
      if (byte < 128) return value
    }
    throw new Error('Protobuf varint exceeds 64 bits')
  }
  const consume = (length: number): Uint8Array => {
    if (length > bytes.length - offset) throw new Error('Truncated protobuf field')
    const value = bytes.subarray(offset, offset + length)
    offset += length
    return value
  }
  while (offset < bytes.length) {
    const tag = varint()
    const number = tag >> 3n
    if (number === 0n || number > 0x1fffffffn) throw new Error('Invalid protobuf field number')
    const wireType = Number(tag & 7n)
    const field = type?.fieldsById[Number(number)]
    switch (wireType) {
      case 0:
        varint()
        break
      case 1:
        consume(8)
        break
      case 2: {
        const length = varint()
        if (length > BigInt(bytes.length - offset)) throw new Error('Truncated protobuf field')
        const value = consume(Number(length))
        if (field?.resolvedType instanceof protobuf.Type) {
          validateWire(value, field.resolvedType, depth + 1)
        } else if (field?.repeated && field.type === 'int64') {
          // The current gift schema has one packed scalar list: gift_tag.
          let index = 0
          while (index < value.length) {
            let done = false
            for (let count = 0; count < 10; count++) {
              if (index >= value.length) throw new Error('Truncated packed protobuf varint')
              const byte = value[index++]
              if (count === 9 && byte > 1) throw new Error('Packed protobuf varint exceeds 64 bits')
              if (byte < 128) { done = true; break }
            }
            if (!done) throw new Error('Packed protobuf varint exceeds 64 bits')
          }
        }
        break
      }
      case 5:
        consume(4)
        break
      default:
        throw new Error(`Unsupported protobuf wire type ${wireType}`)
    }
  }
}
