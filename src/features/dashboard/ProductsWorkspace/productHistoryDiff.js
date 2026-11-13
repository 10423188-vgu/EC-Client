export function buildHistoryDiff(beforeText, afterText) {
  const before = beforeText.split('\n').map((text) => ({ text, changed: true }))
  const after = afterText.split('\n').map((text) => ({ text, changed: true }))
  let start = 0
  let beforeEnd = before.length
  let afterEnd = after.length

  while (
    start < beforeEnd &&
    start < afterEnd &&
    before[start].text === after[start].text
  ) {
    before[start].changed = after[start].changed = false
    start += 1
  }
  while (
    beforeEnd > start &&
    afterEnd > start &&
    before[beforeEnd - 1].text === after[afterEnd - 1].text
  ) {
    beforeEnd -= 1
    afterEnd -= 1
    before[beforeEnd].changed = after[afterEnd].changed = false
  }

  const oldCount = beforeEnd - start
  const newCount = afterEnd - start
  // why: cap the comparison matrix for large descriptions/JSON to keep the UI responsive.
  // Common leading/trailing lines stay neutral; the remaining block is a replacement.
  if (oldCount * newCount > 250_000) return { before, after }

  const lengths = Array.from(
    { length: oldCount + 1 },
    () => new Uint32Array(newCount + 1),
  )
  for (let oldIndex = oldCount - 1; oldIndex >= 0; oldIndex -= 1) {
    for (let newIndex = newCount - 1; newIndex >= 0; newIndex -= 1) {
      lengths[oldIndex][newIndex] =
        before[start + oldIndex].text === after[start + newIndex].text
          ? lengths[oldIndex + 1][newIndex + 1] + 1
          : Math.max(
              lengths[oldIndex + 1][newIndex],
              lengths[oldIndex][newIndex + 1],
            )
    }
  }

  let oldIndex = 0
  let newIndex = 0
  while (oldIndex < oldCount && newIndex < newCount) {
    if (before[start + oldIndex].text === after[start + newIndex].text) {
      before[start + oldIndex].changed = false
      after[start + newIndex].changed = false
      oldIndex += 1
      newIndex += 1
    } else if (
      lengths[oldIndex + 1][newIndex] >= lengths[oldIndex][newIndex + 1]
    ) {
      oldIndex += 1
    } else {
      newIndex += 1
    }
  }

  return { before, after }
}
