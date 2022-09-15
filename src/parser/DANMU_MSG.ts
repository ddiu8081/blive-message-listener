import type { DanmuMsg } from "../app";

const intToColorHex = (int: number) => {
  const hex = int.toString(16);
  return hex.length === 1 ? `#0${hex}` : `#${hex}`;
};

export default (data: any): DanmuMsg => {
  const content = data.info[1]
  const username = data.info[2][1]
  const badge: DanmuMsg['user']['badge'] = data.info[3].length ? {
    active: data.info[3][7] !== 12632256,
    name: data.info[3][1],
    level: data.info[3][0],
    color: intToColorHex(data.info[3][4]),
    anchor: {
      uid: data.info[3][12],
      uname: data.info[3][2],
      room_id: data.info[3][3],
    },
  } : undefined
  return {
    user: {
      uid: data.info[2][0],
      uname: username,
      badge,
      identity: {
        rank: data.info[4][4],
        guard_level: data.info[7],
        room_admin: data.info[2][2] === 1,
      },
    },
    content,
    emoticon: data.info[0][13]?.emoticon_unique ? {
      id: data.info[0][13].emoticon_unique,
      height: data.info[0][13].height,
      width: data.info[0][13].width,
      url: data.info[0][13].url,
    } : undefined,
  }
}