export const readMock = <T>(path: string): Promise<T> => {
  const file = Bun.file(new URL(`../mock/${path}`, import.meta.url))
  return file.json() as Promise<T>
}
