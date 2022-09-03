import type { DanmuMsg } from "../app";

export default (data): DanmuMsg => {
  const content = data.info[1]
  const username = data.info[2][1]
  const badge = data.info[3].length ? {
    name: data.info[3][1],
    level: data.info[3][0],
  } : undefined
  return {
    user: {
      uid: data.info[2][0],
      uname: username,
      badge,
    },
    content,
  }
}