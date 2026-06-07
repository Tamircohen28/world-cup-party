import { describe, it, expect } from 'vitest';
import {
  STAGE_KEYS,
  KNOCKOUT_STAGE_KEYS,
  STAGE_MULTIPLIER,
  STAGE_MULTIPLIER_LABEL,
  IDT_TIMEZONE,
  DEFAULT_WATCH_PARTY_ITEMS,
  BADGE_DESCRIPTIONS,
  CORNER_BUCKETS,
  RSVP_STATUS,
} from '../constants';

describe('STAGE_KEYS', () => {
  it('includes all 7 stages', () => {
    expect(STAGE_KEYS).toHaveLength(7);
  });

  it('includes group stage', () => {
    expect(STAGE_KEYS).toContain('group');
  });

  it('includes final', () => {
    expect(STAGE_KEYS).toContain('final');
  });
});

describe('KNOCKOUT_STAGE_KEYS', () => {
  it('does not include group stage', () => {
    expect(KNOCKOUT_STAGE_KEYS).not.toContain('group');
  });

  it('includes all 6 knockout stages', () => {
    expect(KNOCKOUT_STAGE_KEYS).toHaveLength(6);
  });
});

describe('STAGE_MULTIPLIER', () => {
  it('group stage multiplier is 1', () => {
    expect(STAGE_MULTIPLIER.group).toBe(1);
  });

  it('final has the highest multiplier', () => {
    const max = Math.max(...Object.values(STAGE_MULTIPLIER));
    expect(STAGE_MULTIPLIER.final).toBe(max);
  });

  it('all knockout stages have multiplier > 1', () => {
    KNOCKOUT_STAGE_KEYS.forEach(stage => {
      expect(STAGE_MULTIPLIER[stage]).toBeGreaterThan(1);
    });
  });
});

describe('STAGE_MULTIPLIER_LABEL', () => {
  it('has a label for every stage', () => {
    STAGE_KEYS.forEach(stage => {
      expect(STAGE_MULTIPLIER_LABEL[stage]).toBeDefined();
    });
  });

  it('labels start with ×', () => {
    Object.values(STAGE_MULTIPLIER_LABEL).forEach(label => {
      expect(label).toMatch(/^×/);
    });
  });
});

describe('IDT_TIMEZONE', () => {
  it('is Asia/Jerusalem', () => {
    expect(IDT_TIMEZONE).toBe('Asia/Jerusalem');
  });

  it('is a valid IANA timezone', () => {
    expect(() => new Intl.DateTimeFormat('en', { timeZone: IDT_TIMEZONE })).not.toThrow();
  });
});

describe('DEFAULT_WATCH_PARTY_ITEMS', () => {
  it('has at least 5 items', () => {
    expect(DEFAULT_WATCH_PARTY_ITEMS.length).toBeGreaterThanOrEqual(5);
  });

  it('every item has name and emoji', () => {
    DEFAULT_WATCH_PARTY_ITEMS.forEach(item => {
      expect(typeof item.name).toBe('string');
      expect(typeof item.emoji).toBe('string');
    });
  });

  it('includes a TV/projector item', () => {
    const hasTV = DEFAULT_WATCH_PARTY_ITEMS.some(i => i.name.toLowerCase().includes('tv'));
    expect(hasTV).toBe(true);
  });
});

describe('BADGE_DESCRIPTIONS', () => {
  it('has descriptions for all badge keys', () => {
    expect(Object.keys(BADGE_DESCRIPTIONS).length).toBeGreaterThan(5);
  });

  it('all descriptions are non-empty strings', () => {
    Object.values(BADGE_DESCRIPTIONS).forEach(desc => {
      expect(typeof desc).toBe('string');
      expect(desc.length).toBeGreaterThan(0);
    });
  });
});

describe('CORNER_BUCKETS', () => {
  it('has 4 buckets', () => {
    expect(CORNER_BUCKETS).toHaveLength(4);
  });

  it('covers the full range starting from 0', () => {
    expect(CORNER_BUCKETS[0]).toBe('0-5');
  });
});

describe('RSVP_STATUS', () => {
  it('has attending, maybe, and not-attending values', () => {
    expect(RSVP_STATUS.ATTENDING).toBe('attending');
    expect(RSVP_STATUS.MAYBE).toBe('maybe');
    expect(RSVP_STATUS.NOT_ATTENDING).toBe('not-attending');
  });
});
