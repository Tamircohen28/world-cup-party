import { describe, it, expect } from 'vitest';
import { getFlag, getStageName, getStageColor } from '../flags';

describe('getFlag', () => {
  it('returns the correct flag emoji for known teams', () => {
    expect(getFlag('Brazil')).toBe('🇧🇷');
    expect(getFlag('France')).toBe('🇫🇷');
    expect(getFlag('USA')).toBe('🇺🇸');
    expect(getFlag('Mexico')).toBe('🇲🇽');
    expect(getFlag('Argentina')).toBe('🇦🇷');
    expect(getFlag('Germany')).toBe('🇩🇪');
    expect(getFlag('England')).toBe('🏴󠁧󠁢󠁥󠁮󠁧󠁿');
  });

  it('returns the neutral flag for TBD', () => {
    expect(getFlag('TBD')).toBe('🏳️');
  });

  it('returns the neutral flag for null/undefined', () => {
    expect(getFlag(null)).toBe('🏳️');
    expect(getFlag(undefined)).toBe('🏳️');
  });

  it('returns the neutral flag for unknown team names', () => {
    expect(getFlag('Wakanda')).toBe('🏳️');
    expect(getFlag('')).toBe('🏳️');
  });
});

describe('getStageName', () => {
  it('returns human-readable names for all stages', () => {
    expect(getStageName('group')).toBe('Group Stage');
    expect(getStageName('r32')).toBe('Round of 32');
    expect(getStageName('r16')).toBe('Round of 16');
    expect(getStageName('qf')).toBe('Quarter-Finals');
    expect(getStageName('sf')).toBe('Semi-Finals');
    expect(getStageName('third')).toBe('3rd Place');
    expect(getStageName('final')).toBe('Final');
  });

  it('returns the raw stage key for unknown stages', () => {
    expect(getStageName('unknown')).toBe('unknown');
  });
});

describe('getStageColor', () => {
  it('returns a non-empty class string for each known stage', () => {
    ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'].forEach(stage => {
      const cls = getStageColor(stage);
      expect(typeof cls).toBe('string');
      expect(cls.length).toBeGreaterThan(0);
    });
  });

  it('falls back to group color for unknown stages', () => {
    expect(getStageColor('unknown')).toBe(getStageColor('group'));
  });

  it('each stage has a unique color class', () => {
    const colors = ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'].map(getStageColor);
    const unique = new Set(colors);
    expect(unique.size).toBe(7);
  });
});
