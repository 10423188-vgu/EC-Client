export const flattenCategories = (categories) => {
  const flattened = []
  const pending = [...categories].reverse()

  while (pending.length) {
    const category = pending.pop()
    flattened.push(category)
    const children = category.children ?? []
    for (let index = children.length - 1; index >= 0; index -= 1) {
      pending.push(children[index])
    }
  }

  return flattened
}
