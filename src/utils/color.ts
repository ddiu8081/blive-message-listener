export const intToColorHex = (int: number = 0) => {
  const hex = int.toString(16)
  return `#${hex.padStart(6, '0')}`
}