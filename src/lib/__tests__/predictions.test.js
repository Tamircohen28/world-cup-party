import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getPredictionState,
  deriveResult,
  getMaxPoints,
  STAGE_MULTIPLIER,
  KNOCKOUT_STAGES,
} from '../predictions';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const makeMatch = (overrides = {}) => ({
  home_team: 'Brazil',
  away_team: 'France',
  kickoff_utc: new Date(Date.now() + 3_600_000).toISOString(), // 1 hour from now
  stage: 'group',
  status: 'scheduled',
  ...overrides,
});

const makePrediction = (overrides = {}) => ({
  home_score: 1,
  away_score: 0,
  ...overrides,
});

// ---------------------------------------------------------------------------
// getPredictionState
// ---------------------------------------------------------------------------

describe('getPredictionState', () => {
  it('returns "open" for a future match with known teams and no prediction', () => {
    expect(getPredictionState(makeMatch(), null)).toBe('open');
  });

  it('returns "open" for a future match with a partial prediction already saved', () => {
    // Having an existing prediction doesn't lock it — only kickoff does
    expect(getPredictionState(makeMatch(), makePrediction())).toBe('open');
  });

  it('returns "too_early" when home team is TBD', () => {
    expect(getPredictionState(makeMatch({ home_team: 'TBD' }), null)).toBe('too_early');
  });

  it('returns "too_early" when away team is TBD', () => {
    expect(getPredictionState(makeMatch({ away_team: 'TBD' }), null)).toBe('too_early');
  });

  it('returns "locked" for a past match with a prediction', () => {
    const past = makeMatch({ kickoff_utc: new Date(Date.now() - 1000).toISOString() });
    expect(getPredictionState(past, makePrediction())).toBe('locked');
  });

  it('returns "missed" for a past match with no prediction', () => {
    const past = makeMatch({ kickoff_utc: new Date(Date.now() - 1000).toISOString() });
    expect(getPredictionState(past, null)).toBe('missed');
  });

  it('returns "locked" for a live match with a prediction', () => {
    expect(getPredictionState(makeMatch({ status: 'live' }), makePrediction())).toBe('locked');
  });

  it('returns "missed" for a live match with no prediction', () => {
    expect(getPredictionState(makeMatch({ status: 'live' }), null)).toBe('missed');
  });

  it('returns "revealed" for a finished match regardless of prediction', () => {
    expect(getPredictionState(makeMatch({ status: 'finished' }), null)).toBe('revealed');
    expect(getPredictionState(makeMatch({ status: 'finished' }), makePrediction())).toBe('revealed');
  });
});

// ---------------------------------------------------------------------------
// deriveResult
// ---------------------------------------------------------------------------

describe('deriveResult', () => {
  it('returns "home" when home score is higher', () => {
    expect(deriveResult(2, 1)).toBe('home');
    expect(deriveResult(1, 0)).toBe('home');
  });

  it('returns "away" when away score is higher', () => {
    expect(deriveResult(0, 1)).toBe('away');
    expect(deriveResult(1, 3)).toBe('away');
  });

  it('returns "draw" when scores are equal', () => {
    expect(deriveResult(0, 0)).toBe('draw');
    expect(deriveResult(2, 2)).toBe('draw');
  });
});

// ---------------------------------------------------------------------------
// getMaxPoints
// ---------------------------------------------------------------------------

describe('getMaxPoints', () => {
  it('returns 5 for group stage (multiplier × 1)', () => {
    expect(getMaxPoints('group')).toBe(5);
  });

  it('returns 7.5 for r32 (multiplier × 1.5)', () => {
    expect(getMaxPoints('r32')).toBe(7.5);
  });

  it('returns 10 for r16 (multiplier × 2)', () => {
    expect(getMaxPoints('r16')).toBe(10);
  });

  it('returns 15 for qf (multiplier × 3)', () => {
    expect(getMaxPoints('qf')).toBe(15);
  });

  it('returns 20 for sf (multiplier × 4)', () => {
    expect(getMaxPoints('sf')).toBe(20);
  });

  it('returns 25 for final (multiplier × 5)', () => {
    expect(getMaxPoints('final')).toBe(25);
  });

  it('defaults to group multiplier for unknown stage', () => {
    expect(getMaxPoints('unknown')).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// STAGE_MULTIPLIER constants
// ---------------------------------------------------------------------------

describe('STAGE_MULTIPLIER', () => {
  it('covers all knockout stages', () => {
    KNOCKOUT_STAGES.forEach(stage => {
      expect(STAGE_MULTIPLIER[stage]).toBeGreaterThan(1);
    });
  });

  it('group stage multiplier is exactly 1', () => {
    expect(STAGE_MULTIPLIER.group).toBe(1);
  });

  it('final has the highest multiplier', () => {
    const values = Object.values(STAGE_MULTIPLIER);
    expect(STAGE_MULTIPLIER.final).toBe(Math.max(...values));
  });
});
