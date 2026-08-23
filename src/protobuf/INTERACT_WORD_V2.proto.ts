import protobuf from 'protobufjs'

const protoRoot = protobuf.Root.fromJSON({
  nested: {
    InteractWordV2: {
      fields: {
        daily_rank: { id: 17, type: 'uint32' },
        fans_medal: { id: 9, type: 'FansMedal' },
        guard_level: { id: 16, type: 'uint32' },
        msg_type: { id: 5, type: 'MsgType' },
        rank_info: { id: 12, type: 'RankInfo' },
        room_id: { id: 6, type: 'uint32' },
        score: { id: 8, type: 'uint64' },
        timestamp: { id: 7, type: 'uint32' },
        trigger_time: { id: 15, type: 'uint64' },
        uid: { id: 1, type: 'uint64' },
        uinfo: { id: 22, type: 'UserInfo' },
        uname: { id: 2, type: 'string' },
      },
      nested: {
        FansMedal: {
          fields: {
            color: { id: 4, type: 'uint32' },
            color_border: { id: 7, type: 'uint32' },
            color_end: { id: 6, type: 'uint32' },
            color_start: { id: 5, type: 'uint32' },
            guard_level: { id: 9, type: 'uint32' },
            is_lighted: { id: 8, type: 'uint32' },
            medal_level: { id: 2, type: 'uint32' },
            medal_name: { id: 3, type: 'string' },
            room_id: { id: 12, type: 'uint32' },
            score: { id: 13, type: 'uint32' },
            target_id: { id: 1, type: 'uint64' },
          },
        },
        MsgType: {
          values: {
            MSG_ENTER_ROOM: 1,
            MSG_FOLLOW: 2,
            MSG_SHARE_ROOM: 3,
            MSG_UNKNOWN: 0,
          },
        },
        RankInfo: {
          fields: {
            rank: { id: 1, type: 'uint32' },
          },
        },
        UserInfo: {
          fields: {
            base: { id: 2, type: 'BaseInfo' },
            guard: { id: 6, type: 'GuardInfo' },
            medal_info: { id: 3, type: 'MedalInfo' },
            uid: { id: 1, type: 'uint64' },
            wealth: { id: 4, type: 'WealthInfo' },
          },
          nested: {
            BaseInfo: {
              fields: {
                face: { id: 2, type: 'string' },
                name_color_str: { id: 8, type: 'string' },
                origin_info: { id: 6, type: 'OriginInfo' },
                uname: { id: 1, type: 'string' },
              },
              nested: {
                OriginInfo: {
                  fields: {
                    face: { id: 2, type: 'string' },
                    name: { id: 1, type: 'string' },
                  },
                },
              },
            },
            GuardInfo: {
              fields: {
                expired_str: { id: 2, type: 'string' },
                level: { id: 1, type: 'uint32' },
              },
            },
            MedalInfo: {
              fields: {
                color: { id: 6, type: 'uint32' },
                color_border: { id: 5, type: 'uint32' },
                color_end: { id: 4, type: 'uint32' },
                color_start: { id: 3, type: 'uint32' },
                guard_icon: { id: 13, type: 'string' },
                guard_level: { id: 11, type: 'uint32' },
                id: { id: 7, type: 'uint32' },
                is_lighted: { id: 9, type: 'uint32' },
                medal_level: { id: 2, type: 'uint32' },
                medal_name: { id: 1, type: 'string' },
                ruid: { id: 10, type: 'uint64' },
                score: { id: 12, type: 'uint32' },
                v2_medal_color_border: { id: 17, type: 'string' },
                v2_medal_color_end: { id: 16, type: 'string' },
                v2_medal_color_level: { id: 19, type: 'string' },
                v2_medal_color_start: { id: 15, type: 'string' },
                v2_medal_color_text: { id: 18, type: 'string' },
              },
            },
            WealthInfo: {
              fields: {
                level: { id: 1, type: 'uint32' },
              },
            },
          },
        },
      },
    },
  },
})

const InteractWordV2Message = protoRoot.lookupType('InteractWordV2')

/**
 * 解析 INTERACT_WORD_V2 的 protobuf 数据
 * @param base64Data base64 编码的 protobuf 数据
 * @returns 解析后的对象
 */
export const decode = (base64Data: string): any => {
  if (!base64Data) {
    return null
  }
  const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))
  const message = InteractWordV2Message.decode(binaryData)
  return InteractWordV2Message.toObject(message, {
    arrays: true,
    bytes: String,
    defaults: false,
    enums: Number,
    longs: Number,
    objects: true,
    oneofs: true,
  })
}
