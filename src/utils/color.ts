export const intToColorHex = (int: number) => {
  const hex = int.toString(16)
  return hex.length === 1 ? `#0${hex}` : `#${hex}`
}