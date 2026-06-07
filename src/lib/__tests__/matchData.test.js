import { describe, it, expect } from 'vitest';
import { ALL_MATCHES } from '../matchData';

describe('ALL_MATCHES', () => {
  it('contains exactly 104 matches', () => {
    expect(ALL_MATCHES).toHaveLength(104);
  });

  it('every match has required fields', () => {
    ALL_MATCHES.forEach((m, i) => {
      expect(m.match_number, `match ${i} missing match_number`).toBeDefined();
      expect(m.home_team, `match ${i} missing home_team`).toBeDefined();
      expect(m.away_team, `match ${i} missing away_team`).toBeDefined();
      expect(m.kickoff_utc, `match ${i} missing kickoff_utc`).toBeDefined();
      expect(m.stage, `match ${i} missing stage`).toBeDefined();
      expect(m.stadium, `match ${i} missing stadium`).toBeDefined();
    });
  });

  it('all kickoff_utc values are valid ISO 8601 strings', () => {
    ALL_MATCHES.forEach((m, i) => {
      const d = new Date(m.kickoff_utc);
      expect(isNaN(d.getTime()), `match ${i} has invalid date: ${m.kickoff_utc}`).toBe(false);
    });
  });

  it('all kickoff times are in 2026', () => {
    ALL_MATCHES.forEach(m => {
      const year = new Date(m.kickoff_utc).getUTCFullYear();
      expect(year).toBe(2026);
    });
  });

  it('tournament runs between June and July 2026', () => {
    const months = ALL_MATCHES.map(m => new Date(m.kickoff_utc).getUTCMonth()); // 0-indexed
    const uniqueMonths = [...new Set(months)];
    // June = 5, July = 6
    uniqueMonths.forEach(month => expect([5, 6]).toContain(month));
  });

  it('all stages are valid', () => {
    const VALID_STAGES = new Set(['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final']);
    ALL_MATCHES.forEach((m, i) => {
      expect(VALID_STAGES.has(m.stage), `match ${i} has invalid stage: ${m.stage}`).toBe(true);
    });
  });

  it('group stage matches have group_name and matchday', () => {
    const groupMatches = ALL_MATCHES.filter(m => m.stage === 'group');
    expect(groupMatches.length).toBeGreaterThan(0);
    groupMatches.forEach(m => {
      expect(m.group_name).toBeDefined();
      expect(m.matchday).toBeDefined();
    });
  });

  it('match numbers are sequential starting from 1', () => {
    const nums = ALL_MATCHES.map(m => m.match_number).sort((a, b) => a - b);
    expect(nums[0]).toBe(1);
    expect(nums[nums.length - 1]).toBe(104);
  });

  it('the opening match is Mexico vs South Africa on June 11', () => {
    const opener = ALL_MATCHES.find(m => m.match_number === 1);
    expect(opener.home_team).toBe('Mexico');
    expect(opener.away_team).toBe('South Africa');
    expect(opener.kickoff_utc).toContain('2026-06-11');
  });

  it('there is exactly one final', () => {
    const finals = ALL_MATCHES.filter(m => m.stage === 'final');
    expect(finals).toHaveLength(1);
  });

  it('there are exactly 2 semi-finals', () => {
    const semis = ALL_MATCHES.filter(m => m.stage === 'sf');
    expect(semis).toHaveLength(2);
  });
});
