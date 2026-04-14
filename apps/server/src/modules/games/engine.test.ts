import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateLevel,
  calculateSpellingBeeScore,
  evaluateWordleGuess,
  scrambleWord,
} from './engines.js'

test('evaluateWordleGuess marks exact matches before present letters', () => {
  const result = evaluateWordleGuess('ALLEY', 'APPLE')

  assert.equal(result[0].status, 'correct')
  assert.equal(result[1].status, 'present')
  assert.equal(result[2].status, 'absent')
})

test('scrambleWord preserves the same letters in a different order', () => {
  const scrambled = scrambleWord('planet')

  assert.notEqual(scrambled, 'PLANET')
  assert.deepEqual(scrambled.split('').sort(), 'PLANET'.split('').sort())
})

test('calculateSpellingBeeScore rewards longer words and levels scale with xp', () => {
  assert.equal(calculateSpellingBeeScore('earn'), 1)
  assert.equal(calculateSpellingBeeScore('hearth'), 7)
  assert.equal(calculateLevel(0), 1)
  assert.equal(calculateLevel(500), 3)
})
