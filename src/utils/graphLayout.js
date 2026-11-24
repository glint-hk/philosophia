// Deterministic positions keep labels separated and preserve reading order.
export function graphLayout(width, count) {
  const mobile = width < 760
  const singleColumn = width < 480
  const cardWidth = singleColumn ? Math.min(320, width - 48) : mobile ? Math.min(220, (width - 44) / 2) : Math.min(240, width * 0.25)
  const height = mobile ? 290 + Math.ceil(count / (singleColumn ? 1 : 2)) * 204 : Math.max(560, Math.ceil(count / 2) * 204 + 80)
  const center = { x: width / 2, y: mobile ? 112 : height / 2 }
  const nodes = Array.from({ length: count }, (_, i) => {
    const side = i % 2
    const row = Math.floor(i / 2)
    const rows = Math.ceil((count - side) / 2)
    return {
      x: singleColumn ? width / 2 : mobile ? (side ? width - 16 - cardWidth / 2 : 16 + cardWidth / 2) : (side ? width - 28 - cardWidth / 2 : 28 + cardWidth / 2),
      y: mobile ? 328 + (singleColumn ? i : row) * 204 : height / 2 + (row - (rows - 1) / 2) * 220,
    }
  })
  return { mobile, cardWidth, height, center, nodes }
}
