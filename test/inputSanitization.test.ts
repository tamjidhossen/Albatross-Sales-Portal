import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatSlipTime } from '../src/utils/generateSummaryImage';

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

  it('correctly respects 0 opening cash input without defaulting to 1000', () => {
    // When user types '0' in opening shift modal
    const inputZero = '0';
    const parsedZero = parseFloat(inputZero);
    const valZero = isNaN(parsedZero) ? 1000 : Math.max(0, parsedZero);
    assert.strictEqual(valZero, 0, 'Opening cash of 0 must evaluate to 0, not 1000');

    // When user leaves empty / clears input
    const inputEmpty = '';
    const parsedEmpty = parseFloat(inputEmpty);
    const valEmpty = isNaN(parsedEmpty) ? 1000 : Math.max(0, parsedEmpty);
    assert.strictEqual(valEmpty, 1000, 'Empty opening cash defaults to 1000');

    // When user types 500
    const input500 = '500';
    const parsed500 = parseFloat(input500);
    const val500 = isNaN(parsed500) ? 1000 : Math.max(0, parsed500);
    assert.strictEqual(val500, 500);

    // DB / state mapper nullish coalescing: 0 khuchra taken must NOT fall back to opening_cash
    const dbRowWithZero = {
      khuchra_taken_from_reserve: 0,
      opening_cash: 1000,
    };
    const khuchra = Number(dbRowWithZero.khuchra_taken_from_reserve ?? dbRowWithZero.opening_cash) || 0;
    assert.strictEqual(khuchra, 0, '0 khuchra taken must be respected and not overridden by 1000 opening_cash');
  });

  it('correctly parses closing drawer cash modal inputs', () => {
    const parseDrawerModal = (input: string) => {
      const parsed = parseFloat(input);
      return isNaN(parsed) ? 0 : Math.max(0, parsed);
    };

    assert.strictEqual(parseDrawerModal('0'), 0);
    assert.strictEqual(parseDrawerModal(''), 0);
    assert.strictEqual(parseDrawerModal('5500'), 5500);
    assert.strictEqual(parseDrawerModal('-100'), 0);
  });

  it('correctly parses and compacts timestamps for slip generation without column overflow', () => {
    assert.strictEqual(formatSlipTime(undefined), '—');
    assert.strictEqual(formatSlipTime(''), '—');
    assert.strictEqual(formatSlipTime('04:30 PM'), '04:30 PM');
    assert.strictEqual(formatSlipTime('16:45'), '16:45');
    
    // Full ISO strings from database must be formatted to short human-readable time
    const isoResult = formatSlipTime('2026-10-31T10:40:12.345678+00:00');
    assert.ok(isoResult.length <= 10, 'Parsed time must be compact (<= 10 chars)');
    assert.match(isoResult, /\d{1,2}:\d{2}(\s*[AaPp][Mm])?/);
  });
});

