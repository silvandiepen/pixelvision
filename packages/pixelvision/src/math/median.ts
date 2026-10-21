/**
 * Selects the lower median of `values[low..high]` in place by quickselect
 * (the middle value for odd counts, the lower of the two middle values for
 * even counts). Reorders the range. Used by robust estimators that need
 * this exact selection rule.
 *
 * @param values - Array to partially reorder.
 * @param low - First index of the range.
 * @param high - Last index of the range.
 * @returns The lower median.
 */
export const selectLowerMedian = (
  values: { [index: number]: number },
  low: number,
  high: number,
): number => {
  const median = (low + high) >> 1;
  const swap = (i: number, j: number) => {
    const t = values[i];
    values[i] = values[j];
    values[j] = t;
  };
  for (;;) {
    if (high <= low) return values[median];
    if (high === low + 1) {
      if (values[low] > values[high]) swap(low, high);
      return values[median];
    }
    const middle = (low + high) >> 1;
    if (values[middle] > values[high]) swap(middle, high);
    if (values[low] > values[high]) swap(low, high);
    if (values[middle] > values[low]) swap(middle, low);
    let ll = low + 1;
    swap(middle, ll);
    let hh = high;
    for (;;) {
      do ll++;
      while (values[low] > values[ll]);
      do hh--;
      while (values[hh] > values[low]);
      if (hh < ll) break;
      swap(ll, hh);
    }
    swap(low, hh);
    if (hh <= median) low = ll;
    else high = hh - 1;
  }
};

/**
 * Returns the median of a list of numbers: the middle value, or the mean
 * of the two middle values for an even count. The input isn't modified.
 *
 * @param values - Numbers.
 * @returns The median, or `NaN` for an empty list.
 *
 * @example
 * median([3, 1, 2]); // 2
 * median([4, 1, 3, 2]); // 2.5
 */
export function median(values: ArrayLike<number>): number {
  const n = values.length;
  if (n === 0) return Number.NaN;
  const copy = Float64Array.from(values);
  const lower = selectLowerMedian(copy, 0, n - 1);
  if (n % 2 === 1) return lower;
  let upper = Infinity;
  for (let i = n >> 1; i < n; i++) if (copy[i] < upper) upper = copy[i];
  return (lower + upper) / 2;
}
