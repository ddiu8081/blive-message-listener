import type { GuardBuyMsg } from "../app";

export default (data: any): GuardBuyMsg => {
  const { uid, username, price, gift_id, gift_name, guard_level, start_time, end_time } = data.data
  return {
    user: {
      uid,
      uname: username,
    },
    price,
    gift_id,
    gift_name,
    member: 0,
    start_time: 0,
    end_time: 0,
  }
}