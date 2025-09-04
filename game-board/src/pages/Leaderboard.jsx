// src/pages/Leaderboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [sevenStats, setSevenStats] = useState(null);
  const [judgementStats, setJudgementStats] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: sevenData } = await supabase
        .from("score_tables")
        .select("*")
        .eq("game", "SevenCards");

      const { data: judData } = await supabase
        .from("score_tables")
        .select("*")
        .eq("game", "Judgement");

      // --- Summary ---
      const totalSevenGames = sevenData?.length || 0;
      const totalJudgementGames = judData?.length || 0;

      const sevenPlayers = new Set();
      sevenData?.forEach((t) => t.players.forEach((p) => sevenPlayers.add(p)));

      const judPlayers = new Set();
      judData?.forEach((t) => t.players.forEach((p) => judPlayers.add(p)));

      const totalPlayers = new Set([...sevenPlayers, ...judPlayers]).size;

      setSummary({ totalSevenGames, totalJudgementGames, totalPlayers });

      // --- Seven Cards Stats ---
      if (sevenData && sevenData.length > 0) {
        const players = sevenData[0].players;
        const playerStats = players.reduce((acc, p) => {
          acc[p] = { firstWins: 0, secondWins: 0, defeats: 0, zeros: 0, maxScore65Or130: 0 };
          return acc;
        }, {});

        sevenData.forEach((table) => {
          const totals = table.totals;
          const sorted = totals
            .map((score, idx) => ({ player: players[idx], score }))
            .sort((a, b) => a.score - b.score); // less score wins

          playerStats[sorted[0].player].firstWins++;
          if (sorted[1]) playerStats[sorted[1].player].secondWins++;

          playerStats[sorted[sorted.length - 1].player].defeats++;

          table.scores.forEach((row) => {
            row.forEach((val, idx) => {
              const score = parseInt(val) || 0;
              if (score === 0) playerStats[players[idx]].zeros++;
              if (score === 65 || score === 130) playerStats[players[idx]].maxScore65Or130++;
            });
          });
        });

        // Weighted consistency
        const consistencyScores = Object.entries(playerStats).map(([player, stats]) => ({
          player,
          score: stats.firstWins * 5 + stats.secondWins * 3 + stats.zeros * 4 + stats.maxScore65Or130 * 2
        }));

        consistencyScores.sort((a, b) => b.score - a.score);
        const topScore = consistencyScores[0].score;
        const mostConsistent = consistencyScores
          .filter((p) => p.score === topScore)
          .map((p) => p.player)
          .join(", ");

        setSevenStats({ playerStats, mostConsistent });
      }

      // --- Judgement Stats ---
      if (judData && judData.length > 0) {
        const players = judData[0].players;
        const playerStats = players.reduce((acc, p) => {
          acc[p] = { firstWins: 0, secondWins: 0 };
          return acc;
        }, {});

        judData.forEach((table) => {
          const totals = table.totals;
          const sorted = totals
            .map((score, idx) => ({ player: players[idx], score }))
            .sort((a, b) => b.score - a.score); // more score wins

          playerStats[sorted[0].player].firstWins++;
          if (sorted[1]) playerStats[sorted[1].player].secondWins++;
        });

        // Weighted consistency
        const consistencyScores = Object.entries(playerStats).map(([player, stats]) => {
          const playerTotals = judData.map((t) => t.totals[players.indexOf(player)]);
          const positiveScores = playerTotals.filter((s) => s > 0).length;

          const score =
            stats.firstWins * 5 +
            stats.secondWins * 3 +
            positiveScores * 2 +
            playerTotals.reduce((sum, val) => sum + (val % 10 !== 0 ? 1 : 0), 0); // +1 if not divisible by 10

          return { player, score };
        });

        consistencyScores.sort((a, b) => b.score - a.score);
        const topScore = consistencyScores[0].score;
        const mostConsistent = consistencyScores
          .filter((p) => p.score === topScore)
          .map((p) => p.player)
          .join(", ");

        setJudgementStats({ playerStats, mostConsistent });
      }
    };

    fetchStats();
  }, []);

  const renderSevenStats = () => {
    if (!sevenStats) return <p>Loading...</p>;
    const stats = sevenStats.playerStats;

    // Handle ties
    const getTopPlayers = (key) => {
      const maxValue = Math.max(...Object.values(stats).map((s) => s[key]));
      return Object.entries(stats)
        .filter(([, s]) => s[key] === maxValue)
        .map(([p]) => p)
        .join(", ");
    };

    return (
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Seven Cards Statistics 7️⃣</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Winning 1st</h3>
            <p>{getTopPlayers("firstWins")} ({Math.max(...Object.values(stats).map(s => s.firstWins))} wins)</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Winning 2nd</h3>
            <p>{getTopPlayers("secondWins")} ({Math.max(...Object.values(stats).map(s => s.secondWins))} wins)</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Consistent Player</h3>
            <p>{sevenStats.mostConsistent}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Defeats</h3>
            <p>{getTopPlayers("defeats")} ({Math.max(...Object.values(stats).map(s => s.defeats))} losses)</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Maximum 0's Score</h3>
            <p>{getTopPlayers("zeros")} ({Math.max(...Object.values(stats).map(s => s.zeros))} zeros)</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Maximum 65 / 130 Score</h3>
            <p>{getTopPlayers("maxScore65Or130")} ({Math.max(...Object.values(stats).map(s => s.maxScore65Or130))})</p>
          </div>
        </div>
      </div>
    );
  };

  const renderJudgementStats = () => {
    if (!judgementStats) return <p>Loading...</p>;
    const stats = judgementStats.playerStats;

    const getTopPlayers = (key) => {
      const maxValue = Math.max(...Object.values(stats).map((s) => s[key]));
      return Object.entries(stats)
        .filter(([, s]) => s[key] === maxValue)
        .map(([p]) => p)
        .join(", ");
    };

    return (
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Judgement Statistics 🎯</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Winning 1st</h3>
            <p>{getTopPlayers("firstWins")} ({Math.max(...Object.values(stats).map(s => s.firstWins))} wins)</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Winning 2nd</h3>
            <p>{getTopPlayers("secondWins")} ({Math.max(...Object.values(stats).map(s => s.secondWins))} wins)</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Consistent Player</h3>
            <p>{judgementStats.mostConsistent}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      {summary && (
        <div className="mb-12">
          <p>Total Seven Cards Games: {summary.totalSevenGames}</p>
          <p>Total Judgement Games: {summary.totalJudgementGames}</p>
          <p>Total Players: {summary.totalPlayers}</p>
        </div>
      )}
      {renderSevenStats()}
      {renderJudgementStats()}
    </div>
  );
}
