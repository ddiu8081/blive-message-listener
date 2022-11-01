export const intToColorHex = (int: number) => {
  const hex = int.toString(16)
  return `#${hex.padStart(6, '0')}`
}