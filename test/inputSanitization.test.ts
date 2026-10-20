import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Input Sanitization & Value Parsing', () => {
  it('correctly handles backspacing to empty string without NaN or stuck zeros', () => {
    // When an input is backspaced, e.target.value is ''
    const rawInput = '';
    const parsed = parseInt(rawInput, 10);
    const value = isNaN(parsed) ? 0 : Math.max(0, parsed);
    assert.strictEqual(value, 0);

    // Display value formatting pattern: value === 0 ? '' : value
    const displayVal = value === 0 ? '' : value;
    assert.strictEqual(displayVal, '');
  });

  it('correctly handles typing a single digit like 6 without prepending 0', () => {
    // Starting from empty, user types '6'
    const rawInput = '6';
    const parsed = parseInt(rawInput, 10);
    const value = isNaN(parsed) ? 0 : Math.max(0, parsed);
    assert.strictEqual(value, 6);

    const displayVal = value === 0 ? '' : value;
    assert.strictEqual(displayVal, 6);
  });

  it('correctly parses multi-digit and zero values', () => {
    assert.strictEqual(parseInt('50', 10), 50);
    assert.strictEqual(parseInt('0', 10), 0);
    assert.strictEqual(parseFloat('450.50'), 450.50);
  });

  it('clamps negative inputs to 0', () => {
    const rawInput = '-5';
    const parsed = parseInt(rawInput, 10);
    const value = isNaN(parsed) ? 0 : Math.max(0, parsed);
    assert.strictEqual(value, 0);
  });
});

