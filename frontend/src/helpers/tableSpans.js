/** Consecutive identical keys → rowspan on the first row, 0 on following rows. */
export const consecutiveRowSpans = (rows, getKey) => {
  const spans = Array(rows.length).fill(0);
  let i = 0;
  while (i < rows.length) {
    const key = getKey(rows[i]);
    let size = 1;
    while (i + size < rows.length && getKey(rows[i + size]) === key) size += 1;
    spans[i] = size;
    i += size;
  }
  return spans;
};
