export const intToColorHex = (int = 0) => {
  const hex = int.toString(16)
  return `#${hex.padStart(6, '0')}`
}
