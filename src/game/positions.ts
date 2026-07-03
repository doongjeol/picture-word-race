/** Map board index (0..19) to a 6x6 grid cell (row, col), clockwise. */
export function indexToCell(index: number): { row: number; col: number } {
  if (index < 6) return { row: 1, col: index + 1 };           // top: 0..5
  if (index < 11) return { row: index - 4, col: 6 };          // right: 6..10 -> rows 2..6
  if (index < 16) return { row: 6, col: 6 - (index - 10) };   // bottom: 11..15 -> cols 5..1
  return { row: 6 - (index - 15), col: 1 };                   // left: 16..19 -> rows 5..2
}