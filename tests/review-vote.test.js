import assert from 'node:assert/strict'
import test from 'node:test'
import { getNextReviewVote } from '../src/entities/review/model/vote.js'

test('selecting the same review vote a second time clears it', () => {
  assert.equal(getNextReviewVote('helpful', 'helpful'), null)
  assert.equal(getNextReviewVote('not_helpful', 'not_helpful'), null)
})

test('selecting the other review vote replaces the current choice', () => {
  assert.equal(getNextReviewVote('helpful', 'not_helpful'), 'not_helpful')
  assert.equal(getNextReviewVote(null, 'helpful'), 'helpful')
})
