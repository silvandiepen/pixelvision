/** Numbers shown on the marketing pages, all measured or counted at build time. */
export interface SiteFacts {
  version: string;
  /** Size of the package entry, gzipped, in kilobytes (1 decimal). */
  gzipKb: number;
  functionCount: number;
  /** jsfeat functions in the README's parity table. */
  jsfeatRows: number;
  /** Of those, how many give identical output. */
  jsfeatIdentical: number;
}
