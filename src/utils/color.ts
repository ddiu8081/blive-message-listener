export const intToColorHex = (int: number) => {
  const hex = int.toString(16)
  return hex.length === 5 ? `#0${hex}` : `#${hex}`
}