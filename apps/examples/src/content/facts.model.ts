/** Numbers shown on the marketing pages, all measured or counted at build time. */
export interface SiteFacts {
  version: string;
  /** Size of the package entry, gzipped, in kilobytes (1 decimal). */
  gzipKb: number;
  functionCount: number;
  /** Mapped functions in the migration guide's table. */
  jsfeatRows: number;
  /** Of those, how many give identical output. */
  jsfeatIdentical: number;
}
