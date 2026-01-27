import protobuf from 'protobufjs'

// converted from https://github.com/SocialSisterYi/bilibili-API-collect/issues/1332#issuecomment-3046115843
const protoRoot = protobuf.Root.fromJSON({
  nested: {
    InteractWordV2: {
      fields: {
        uid: { type: 'uint64', id: 1 },
        uname: { type: 'string', id: 2 },
        msg_type: { type: 'MsgType', id: 5 },
        room_id: { type: 'uint32', id: 6 },
        timestamp: { type: 'uint32', id: 7 },
        score: { type: 'uint64', id: 8 },
        fans_medal: { type: 'FansMedal', id: 9 },
        rank_info: { type: 'RankInfo', id: 12 },
        trigger_time: { type: 'uint64', id: 15 },
        guard_level: { type: 'uint32', id: 16 },
        daily_rank: { type: 'uint32', id: 17 },
        uinfo: { type: 'UserInfo', id: 22 },
      },
      nested: {
        MsgType: {
          values: {
            MSG_UNKNOWN: 0,
            MSG_ENTER_ROOM: 1,
            MSG_FOLLOW: 2,
            MSG_SHARE_ROOM: 3,
          }
        },
        FansMedal: {
          fields: {
            target_id: { type: 'uint64', id: 1 },
            medal_level: { type: 'uint32', id: 2 },
            medal_name: { type: 'string', id: 3 },
            color: { type: 'uint32', id: 4 },
            color_start: { type: 'uint32', id: 5 },
            color_end: { type: 'uint32', id: 6 },
            color_border: { type: 'uint32', id: 7 },
            is_lighted: { type: 'uint32', id: 8 },
            guard_level: { type: 'uint32', id: 9 },
            room_id: { type: 'uint32', id: 12 },
            score: { type: 'uint32', id: 13 },
          }
        },
        RankInfo: {
          fields: {
            rank: { type: 'uint32', id: 1 },
          }
        },
        UserInfo: {
          fields: {
            uid: { type: 'uint64', id: 1 },
            base: { type: 'BaseInfo', id: 2 },
            medal_info: { type: 'MedalInfo', id: 3 },
            wealth: { type: 'WealthInfo', id: 4 },
            guard: { type: 'GuardInfo', id: 6 },
          },
          nested: {
            BaseInfo: {
              fields: {
                uname: { type: 'string', id: 1 },
                face: { type: 'string', id: 2 },
                origin_info: { type: 'OriginInfo', id: 6 },
                name_color_str: { type: 'string', id: 8 },
              },
              nested: {
                OriginInfo: {
                  fields: {
                    name: { type: 'string', id: 1 },
                    face: { type: 'string', id: 2 },
                  }
                }
              }
            },
            MedalInfo: {
              fields: {
                medal_name: { type: 'string', id: 1 },
                medal_level: { type: 'uint32', id: 2 },
                color_start: { type: 'uint32', id: 3 },
                color_end: { type: 'uint32', id: 4 },
                color_border: { type: 'uint32', id: 5 },
                color: { type: 'uint32', id: 6 },
                id: { type: 'uint32', id: 7 },
                is_lighted: { type: 'uint32', id: 9 },
                ruid: { type: 'uint64', id: 10 },
                guard_level: { type: 'uint32', id: 11 },
                score: { type: 'uint32', id: 12 },
                guard_icon: { type: 'string', id: 13 },
                v2_medal_color_start: { type: 'string', id: 15 },
                v2_medal_color_end: { type: 'string', id: 16 },
                v2_medal_color_border: { type: 'string', id: 17 },
                v2_medal_color_text: { type: 'string', id: 18 },
                v2_medal_color_level: { type: 'string', id: 19 },
              }
            },
            WealthInfo: {
              fields: {
                level: { type: 'uint32', id: 1 },
              }
            },
            GuardInfo: {
              fields: {
                level: { type: 'uint32', id: 1 },
                expired_str: { type: 'string', id: 2 },
              }
            }
          }
        }
      }
    }
  }
})

const InteractWordV2Message = protoRoot.lookupType('InteractWordV2')

/**
 * 解析 INTERACT_WORD_V2 的 protobuf 数据
 * @param base64Data base64 编码的 protobuf 数据
 * @returns 解析后的对象
 */
export const decode = (base64Data: string): any => {
  if (!base64Data) return null
  const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
  const message = InteractWordV2Message.decode(binaryData)
  return InteractWordV2Message.toObject(message, {
    longs: Number,
    enums: Number,
    bytes: String,
    defaults: false,
    arrays: true,
    objects: true,
    oneofs: true,
  })
}
