export const intToColorHex = (int: number | undefined | null) => {
  // 处理 undefined 或 null 的情况，返回默认黑色
  if (int === undefined || int === null || typeof int !== 'number') {
    return '#000000'
  }
  const hex = int.toString(16)
  return `#${hex.padStart(6, '0')}`
}