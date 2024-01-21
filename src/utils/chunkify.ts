export const chunkify = <T>(arr: T[], length: number) => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += length) {
    chunks.push(arr.slice(i, i + length));
  }
  return chunks;
}
