import { describe, it, expect } from 'vitest';
import {
  getFlag,
  getStageName,
  getStageColor,
  getStageBorderColor,
  formatIDT,
  formatDateIDT,
  formatShortDateIDT,
  DEFAULT_ITEMS,
} from '../flags';

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

describe('getStageBorderColor', () => {
  it('returns a border-l class for each known stage', () => {
    ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'].forEach(stage => {
      const cls = getStageBorderColor(stage);
      expect(cls).toMatch(/^border-l-/);
    });
  });

  it('falls back to group border color for unknown stages', () => {
    expect(getStageBorderColor('unknown')).toBe(getStageBorderColor('group'));
  });

  it('each stage has a unique border color', () => {
    const colors = ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'].map(getStageBorderColor);
    expect(new Set(colors).size).toBe(7);
  });
});

describe('formatIDT', () => {
  it('returns a time string in HH:MM format', () => {
    // 2026-06-11T19:00:00Z → 22:00 IDT (UTC+3)
    const result = formatIDT('2026-06-11T19:00:00Z');
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });

  it('offsets UTC by +3 hours for Jerusalem timezone', () => {
    // midnight UTC → 03:00 IDT
    const result = formatIDT('2026-06-11T00:00:00Z');
    expect(result).toBe('03:00');
  });

  it('wraps midnight correctly', () => {
    // 21:00 UTC → 00:00 IDT next day
    const result = formatIDT('2026-06-11T21:00:00Z');
    expect(result).toBe('00:00');
  });
});

describe('formatDateIDT', () => {
  it('returns a full weekday + date string', () => {
    const result = formatDateIDT('2026-06-11T19:00:00Z');
    expect(result).toMatch(/\w+day/); // contains weekday name
    expect(result).toMatch(/June|Jun/);
    expect(result).toContain('11');
  });
});

describe('formatShortDateIDT', () => {
  it('returns an abbreviated date string', () => {
    const result = formatShortDateIDT('2026-06-11T19:00:00Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('is shorter than the full date', () => {
    const full = formatDateIDT('2026-06-11T19:00:00Z');
    const short = formatShortDateIDT('2026-06-11T19:00:00Z');
    expect(short.length).toBeLessThan(full.length);
  });
});

describe('DEFAULT_ITEMS', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(DEFAULT_ITEMS)).toBe(true);
    expect(DEFAULT_ITEMS.length).toBeGreaterThan(0);
  });

  it('each item has name and emoji strings', () => {
    DEFAULT_ITEMS.forEach(item => {
      expect(typeof item.name).toBe('string');
      expect(item.name.length).toBeGreaterThan(0);
      expect(typeof item.emoji).toBe('string');
    });
  });
});
