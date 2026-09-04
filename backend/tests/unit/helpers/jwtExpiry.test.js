'use strict';

const { durationToMs } = require('../../../src/helpers/jwtExpiry');

describe('jwtExpiry', () => {
  it('parses s/m/h/d values', () => {
    expect(durationToMs('20m', 0)).toBe(20 * 60 * 1000);
    expect(durationToMs('7d', 0)).toBe(7 * 24 * 60 * 60 * 1000);
    expect(durationToMs('bogus', 99)).toBe(99);
  });
});
