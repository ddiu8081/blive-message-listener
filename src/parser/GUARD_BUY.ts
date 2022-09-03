import type { GuardBuyMsg } from "../app";

export default (data): GuardBuyMsg => {
  const { uid, username, price, gift_name } = data.data
  return {
    user: {
      uid,
      uname: username,
    },
    price,
    gift_name,
  }
}