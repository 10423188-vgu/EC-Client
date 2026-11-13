import assert from 'node:assert/strict'
import test from 'node:test'
import { buildHistoryDiff } from '../src/features/dashboard/ProductsWorkspace/productHistoryDiff.js'

const changedLines = (lines) =>
  lines.filter((line) => line.changed).map((line) => line.text)

test('identical values have no highlights', () => {
  const diff = buildHistoryDiff('same\nvalue', 'same\nvalue')
  assert.deepEqual(changedLines(diff.before), [])
  assert.deepEqual(changedLines(diff.after), [])
})

test('a replaced value highlights both the old and new lines', () => {
  const diff = buildHistoryDiff('100', '200')
  assert.deepEqual(changedLines(diff.before), ['100'])
  assert.deepEqual(changedLines(diff.after), ['200'])
})

test('inserting a line keeps following unchanged lines neutral', () => {
  const diff = buildHistoryDiff('first\nlast', 'first\nnew\nlast')
  assert.deepEqual(changedLines(diff.before), [])
  assert.deepEqual(changedLines(diff.after), ['new'])
})

test('deleting a line highlights only the removed line', () => {
  const diff = buildHistoryDiff('first\nremoved\nlast', 'first\nlast')
  assert.deepEqual(changedLines(diff.before), ['removed'])
  assert.deepEqual(changedLines(diff.after), [])
})

test('multiple JSON edits preserve unchanged lines between edits', () => {
  const before = JSON.stringify(
    [{ url: 'first.webp', altText: null }, { url: 'last.webp', altText: null }],
    null,
    2,
  )
  const after = JSON.stringify(
    [{ url: 'first.webp', altText: '' }, { url: 'last.webp', altText: '' }],
    null,
    2,
  )
  const diff = buildHistoryDiff(before, after)
  assert.deepEqual(changedLines(diff.before), [
    '    "altText": null',
    '    "altText": null',
  ])
  assert.deepEqual(changedLines(diff.after), [
    '    "altText": ""',
    '    "altText": ""',
  ])
})

test('large replacements keep shared edges neutral without a large matrix', () => {
  const oldBlock = Array.from({ length: 501 }, (_, index) => `old ${index}`)
  const newBlock = Array.from({ length: 501 }, (_, index) => `new ${index}`)
  const diff = buildHistoryDiff(
    ['first', ...oldBlock, 'last'].join('\n'),
    ['first', ...newBlock, 'last'].join('\n'),
  )
  assert.deepEqual(changedLines(diff.before), oldBlock)
  assert.deepEqual(changedLines(diff.after), newBlock)
})
