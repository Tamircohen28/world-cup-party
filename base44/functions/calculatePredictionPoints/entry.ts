import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Stage multipliers
const STAGE_MULTIPLIER = {
  group: 1, r32: 1.5, r16: 2, qf: 3, sf: 4, third: 4, final: 5
};

// Badge conditions checked after stats update
function computeBadges(stats) {
  const badges = new Set(stats.badges || []);
  // Prediction badges
  if (stats.exact_scores >= 3) badges.add('🎯 Sniper');
  if (stats.exact_scores >= 5) badges.add('🔮 Oracle');
  if (stats.current_streak >= 4) badges.add('🔥 On Fire');
  if (stats.current_streak >= 6) badges.add('⚡ Hot Streak');
  if (stats.correct_results >= 10) badges.add('📊 Analyst');
  if (stats.predictions_count >= 20) badges.add('🗳️ Committed');
  return [...badges];
}

function calcPoints(pred, match) {
  const multiplier = STAGE_MULTIPLIER[match.stage] || 1;
  const isKnockout = match.stage !== 'group';

  const actualHome = match.home_score ?? 0;
  const actualAway = match.away_score ?? 0;
  const predHome = pred.home_score ?? 0;
  const predAway = pred.away_score ?? 0;

  // 90-min result
  const actualResult = actualHome > actualAway ? 'home' : actualAway > actualHome ? 'away' : 'draw';

  // For knockout: who advances (could be via pens) - use predicted_winner vs actual winner from result field
  // If match.winner is set (from admin/api), use it. Otherwise use 90-min result.
  const actualWinner = match.winner || (actualResult === 'draw' ? null : actualResult);

  // Determine if result is correct
  let correctResult = false;
  if (isKnockout && pred.predicted_winner && actualWinner) {
    correctResult = pred.predicted_winner === actualWinner;
  } else {
    correctResult = pred.predicted_result === actualResult;
  }

  // Exact score (90-min)
  const exactScore = predHome === actualHome && predAway === actualAway;

  // Correct goal difference
  const predDiff = Math.abs(predHome - predAway);
  const actualDiff = Math.abs(actualHome - actualAway);
  const correctDiff = correctResult && predDiff === actualDiff;

  // Base points
  let basePoints = 0;
  if (exactScore && correctResult) {
    basePoints = 5;
  } else if (correctDiff) {
    basePoints = 3;
  } else if (correctResult) {
    basePoints = 2;
  }

  const baseTotal = Math.round(basePoints * multiplier * 10) / 10;

  // --- Bonus scoring (flat points, no multiplier) ---
  let bonusCorners = 0;
  let bonusCards = 0;
  let bonusRedCard = 0;

  // Corners bucket: exact bucket → +3 pts
  if (pred.bonus_corners_bucket != null && match.actual_corners != null) {
    const c = match.actual_corners;
    const actualBucket = c <= 5 ? '0-5' : c <= 8 ? '6-8' : c <= 11 ? '9-11' : '12+';
    if (pred.bonus_corners_bucket === actualBucket) bonusCorners = 3;
  }

  // Yellow cards: exact → +3 pts, within 1 → +1 pt
  if (pred.bonus_yellow_cards != null && match.actual_yellow_cards != null) {
    const diff = Math.abs(pred.bonus_yellow_cards - match.actual_yellow_cards);
    if (diff === 0) bonusCards = 3;
    else if (diff === 1) bonusCards = 1;
  }

  // Red card yes/no: correct → +2 pts
  if (pred.bonus_red_card != null && match.actual_red_cards != null) {
    const actualHasRed = match.actual_red_cards > 0;
    if (pred.bonus_red_card === actualHasRed) bonusRedCard = 2;
  }

  const bonusTotal = bonusCorners + bonusCards + bonusRedCard;
  const total = Math.round((baseTotal + bonusTotal) * 10) / 10;

  return {
    correct_result: correctResult,
    correct_diff: correctDiff,
    exact_score: exactScore && correctResult,
    base_points: basePoints,
    stage_multiplier: multiplier,
    total,
    bonus_corners: bonusCorners,
    bonus_cards: bonusCards,
    bonus_red_card: bonusRedCard,
    bonus_total: bonusTotal,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    // Called by entity automation (Match update) or directly with { matchId }
    const matchId = body.matchId || body.event?.entity_id || body.data?.id;

    if (!matchId) return Response.json({ error: 'matchId required' }, { status: 400 });

    const matches = await base44.asServiceRole.entities.Match.list('kickoff_utc', 200);
    const match = matches.find(m => m.id === matchId);
    if (!match) return Response.json({ error: 'Match not found' }, { status: 404 });
    if (match.status !== 'finished') return Response.json({ error: 'Match not finished' }, { status: 400 });
    if (match.results_calculated) return Response.json({ skipped: true, reason: 'Already calculated' });

    const allPredictions = await base44.asServiceRole.entities.Prediction.filter({ match_id: matchId });
    const label = `${match.home_team} vs ${match.away_team}`;
    const notifications = [];
    const exactScorerNames = [];

    // Get all existing userStats for rank computation
    const allStats = await base44.asServiceRole.entities.UserStats.list('-total_points', 500);
    const statsMap = {};
    allStats.forEach(s => { statsMap[s.user_id] = s; });

    for (const pred of allPredictions) {
      const breakdown = calcPoints(pred, match);

      // Update prediction doc
      await base44.asServiceRole.entities.Prediction.update(pred.id, {
        points_earned: breakdown.total,
        points_breakdown: breakdown,
      });

      // Update or create userStats
      let stats = statsMap[pred.user_id] || {
        user_id: pred.user_id,
        display_name: pred.user_display_name || '',
        total_points: 0,
        predictions_count: 0,
        correct_results: 0,
        correct_diffs: 0,
        exact_scores: 0,
        current_streak: 0,
        longest_streak: 0,
        badges: [],
      };

      stats.total_points = (stats.total_points || 0) + breakdown.total;
      stats.predictions_count = (stats.predictions_count || 0) + 1;
      if (breakdown.correct_result) {
        stats.correct_results = (stats.correct_results || 0) + 1;
        stats.current_streak = (stats.current_streak || 0) + 1;
        stats.longest_streak = Math.max(stats.longest_streak || 0, stats.current_streak);
      } else {
        stats.current_streak = 0;
      }
      if (breakdown.correct_diff) stats.correct_diffs = (stats.correct_diffs || 0) + 1;
      if (breakdown.exact_score) {
        stats.exact_scores = (stats.exact_scores || 0) + 1;
        exactScorerNames.push(pred.user_display_name || 'Someone');
      }

      stats.badges = computeBadges(stats);
      stats.last_updated = new Date().toISOString();
      statsMap[pred.user_id] = stats;

      // Queue notification for this predictor
      let msg;
      if (breakdown.total > 0) {
        const bonusPart = breakdown.bonus_total > 0 ? ` (+${breakdown.bonus_total} bonus 🎲)` : '';
        msg = breakdown.exact_score
          ? `🎯 EXACT score on ${label}! +${breakdown.total} pts${bonusPart}`
          : `✅ ${label} — +${breakdown.total} pts${bonusPart}`;
      } else {
        msg = `❌ Wrong prediction for ${label}. +0 pts`;
      }
      notifications.push({ user_id: pred.user_id, message: msg, type: 'rsvp_change', match_id: matchId });
    }

    // Recalculate ranks (sort by totalPoints DESC, then exact_scores, then correct_results)
    const sortedStats = Object.values(statsMap).sort((a, b) => {
      if (b.total_points !== a.total_points) return b.total_points - a.total_points;
      if (b.exact_scores !== a.exact_scores) return b.exact_scores - a.exact_scores;
      return b.correct_results - a.correct_results;
    });

    let currentRank = 1;
    for (let i = 0; i < sortedStats.length; i++) {
      if (i > 0 && sortedStats[i].total_points !== sortedStats[i - 1].total_points) {
        currentRank = i + 1;
      }
      const prev = sortedStats[i].rank || currentRank;
      sortedStats[i].previous_rank = prev;
      sortedStats[i].rank = currentRank;
    }

    // Upsert all stats
    for (const s of sortedStats) {
      const existing = allStats.find(x => x.user_id === s.user_id);
      if (existing) {
        await base44.asServiceRole.entities.UserStats.update(existing.id, s);
      } else {
        await base44.asServiceRole.entities.UserStats.create(s);
      }
    }

    // Create notifications
    for (const n of notifications) {
      await base44.asServiceRole.entities.Notification.create({
        user_id: n.user_id,
        type: n.type,
        match_id: n.match_id,
        message: n.message,
        is_read: false,
      });
    }

    // Social notification: exact score
    if (exactScorerNames.length > 0) {
      const allUsers = await base44.asServiceRole.entities.UserStats.list('-total_points', 200);
      for (const u of allUsers) {
        if (!exactScorerNames.includes(u.display_name)) {
          await base44.asServiceRole.entities.Notification.create({
            user_id: u.user_id,
            type: 'rsvp_change',
            match_id: matchId,
            message: `🎯 ${exactScorerNames.join(', ')} nailed the exact score on ${label}!`,
            is_read: false,
          });
        }
      }
    }

    // Mark match as calculated
    await base44.asServiceRole.entities.Match.update(matchId, { results_calculated: true });

    return Response.json({ ok: true, processed: allPredictions.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});