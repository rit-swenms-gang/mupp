import { expect, test } from 'vitest'
import { sum } from './example'

//THIS IS AN EXAMPLE TEST
// By default, tests must contain .test. or .spec. in their file name.
test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})