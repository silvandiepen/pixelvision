export interface CodeBlockProps {
  /** Source code to show. */
  code: string;
  /** File name shown above the code. */
  fileName?: string;
  /**
   * Language to highlight in, as a fence name such as `ts` or `sh`. Without
   * it, the file name's extension decides; `Terminal` means a shell.
   */
  language?: string;
}
