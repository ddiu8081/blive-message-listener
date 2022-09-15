import type { GuardBuyMsg } from "../app";

export default (data: any): GuardBuyMsg => {
  const rawData = data.data
  return {
    user: {
      uid: rawData.uid,
      uname: rawData.username,
    },
    gift_id: rawData.gift_id,
    gift_name: rawData.gift_name,
    guard_level: rawData.guard_level,
    price: rawData.price,
    start_time: rawData.start_time,
    end_time: rawData.end_time,
  }
}