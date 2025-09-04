// src/pages/Leaderboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [sevenStats, setSevenStats] = useState(null);
  const [judgementStats, setJudgementStats] = useState(null);

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
            .sort((a, b) => a.score - b.score); // lower score wins

          playerStats[sorted[0].player].firstWins++;
          if (sorted[1]) playerStats[sorted[1].player].secondWins++;
          playerStats[sorted[sorted.length - 1].player].defeats++;

          table.scores.forEach((row) => {
            row.forEach((val, idx) => {
              const score = parseInt(val);
              if (score >= 0) {
                if (score === 0) playerStats[players[idx]].zeros++;
                if (score === 65 || score === 130) playerStats[players[idx]].maxScore65Or130++;
              }
            });
          });
        });

        // Calculate most consistent using weighted formula
        const consistency = players.map((p, idx) => {
          const stats = playerStats[p];
          const totalScore = sevenData.reduce((sum, table) => sum + table.totals[idx], 0);
          const consistencyScore = stats.zeros * 4 + stats.maxScore65Or130 * 2 - totalScore;
          return { player: p, score: consistencyScore };
        });
        const maxConsistency = Math.max(...consistency.map((c) => c.score));
        const mostConsistent = consistency
          .filter((c) => c.score === maxConsistency)
          .map((c) => c.player)
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
            .sort((a, b) => b.score - a.score); // higher score wins

          playerStats[sorted[0].player].firstWins++;
          if (sorted[1]) playerStats[sorted[1].player].secondWins++;
        });

        // Consistency for Judgement
        const consistency = players.map((p, idx) => {
          const playerTotals = judData.map((t) => t.totals[idx]);
          const positiveSum = playerTotals.filter((s) => s > 0).reduce((a, b) => a + b, 0);
          const weighted = playerTotals
            .filter((s) => s > 0 && s % 10 !== 0)
            .reduce((a, b) => a + 1, 0); // bonus for non-divisible by 10
          return { player: p, score: positiveSum + weighted };
        });
        const maxConsistency = Math.max(...consistency.map((c) => c.score));
        const mostConsistent = consistency
          .filter((c) => c.score === maxConsistency)
          .map((c) => c.player)
          .join(", ");

        setJudgementStats({ playerStats, mostConsistent });
      }
    };

    fetchStats();
  }, []);

  const renderSevenStats = () => {
    if (!sevenStats) return <p>Loading...</p>;
    const stats = sevenStats.playerStats;

    const mostFirst = Object.entries(stats)
      .sort((a, b) => b[1].firstWins - a[1].firstWins)
      .filter((a, i, arr) => a[1].firstWins === arr[0][1].firstWins);

    const mostSecond = Object.entries(stats)
      .sort((a, b) => b[1].secondWins - a[1].secondWins)
      .filter((a, i, arr) => a[1].secondWins === arr[0][1].secondWins);

    const mostDefeats = Object.entries(stats)
      .sort((a, b) => b[1].defeats - a[1].defeats)
      .filter((a, i, arr) => a[1].defeats === arr[0][1].defeats);

    const mostZeros = Object.entries(stats)
      .sort((a, b) => b[1].zeros - a[1].zeros)
      .filter((a, i, arr) => a[1].zeros === arr[0][1].zeros);

    const most65Or130 = Object.entries(stats)
      .sort((a, b) => b[1].maxScore65Or130 - a[1].maxScore65Or130)
      .filter((a, i, arr) => a[1].maxScore65Or130 === arr[0][1].maxScore65Or130);

    return (
      <div className="mb-12 w-full max-w-5xl">
        <h2 className="text-xl font-bold mb-4">Seven Cards Statistics 7️⃣</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Winning 1st</h3>
            <p>
              {mostFirst.map((p) => p[0]).join(", ")} ({mostFirst[0][1].firstWins} wins)
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Winning 2nd</h3>
            <p>
              {mostSecond.map((p) => p[0]).join(", ")} ({mostSecond[0][1].secondWins} wins)
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Consistent Player</h3>
            <p>{sevenStats.mostConsistent}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Defeats</h3>
            <p>
              {mostDefeats.map((p) => p[0]).join(", ")} ({mostDefeats[0][1].defeats} losses)
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Maximum 0's Score</h3>
            <p>
              {mostZeros.map((p) => p[0]).join(", ")} ({mostZeros[0][1].zeros} zeros)
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Maximum 65 / 130 Score</h3>
            <p>
              {most65Or130.map((p) => p[0]).join(", ")} ({most65Or130[0][1].maxScore65Or130})
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderJudgementStats = () => {
    if (!judgementStats) return <p>Loading...</p>;
    const stats = judgementStats.playerStats;

    const mostFirst = Object.entries(stats)
      .sort((a, b) => b[1].firstWins - a[1].firstWins)
      .filter((a, i, arr) => a[1].firstWins === arr[0][1].firstWins);

    const mostSecond = Object.entries(stats)
      .sort((a, b) => b[1].secondWins - a[1].secondWins)
      .filter((a, i, arr) => a[1].secondWins === arr[0][1].secondWins);

    return (
      <div className="mb-12 w-full max-w-5xl">
        <h2 className="text-xl font-bold mb-4">Judgement Statistics 🃏</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Winning 1st</h3>
            <p>
              {mostFirst.map((p) => p[0]).join(", ")} ({mostFirst[0][1].firstWins} wins)
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Winning 2nd</h3>
            <p>
              {mostSecond.map((p) => p[0]).join(", ")} ({mostSecond[0][1].secondWins} wins)
            </p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Consistent Player</h3>
            <p>{judgementStats.mostConsistent}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderCombinedTable = () => {
  if (!sevenStats || !judgementStats) return null;

  const players = Object.keys(sevenStats.playerStats);

  return (
    <div className="overflow-x-auto mb-6">
      <table className="min-w-full bg-white border border-gray-300 rounded shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Player</th>
            <th className="border px-4 py-2">7C 1st</th>
            <th className="border px-4 py-2">7C 2nd</th>
            <th className="border px-4 py-2">7C Last</th>
            <th className="border px-4 py-2">7C Zeros</th>
            <th className="border px-4 py-2">7C 65/130</th>
            <th className="border px-4 py-2">Jud 1st</th>
            <th className="border px-4 py-2">Jud 2nd</th>
            <th className="border px-4 py-2">Jud Last</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => {
            const seven = sevenStats.playerStats[p];
            const jud = judgementStats.playerStats[p] || { firstWins: 0, secondWins: 0 };
            // Judgement last place = total tables - 1st - 2nd
            const judLast =
              judData ? judData.reduce((sum, table) => sum + 1, 0) - jud.firstWins - jud.secondWins : 0;

            return (
              <tr key={p} className="text-center">
                <td className="border px-4 py-2 font-semibold">{p}</td>
                <td className="border px-4 py-2">{seven.firstWins}</td>
                <td className="border px-4 py-2">{seven.secondWins}</td>
                <td className="border px-4 py-2">{seven.defeats}</td>
                <td className="border px-4 py-2">{seven.zeros}</td>
                <td className="border px-4 py-2">{seven.maxScore65Or130}</td>
                <td className="border px-4 py-2">{jud.firstWins}</td>
                <td className="border px-4 py-2">{jud.secondWins}</td>
                <td className="border px-4 py-2">{judLast}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Leaderboard 📊</h1>
      {renderSevenStats()}
      {renderJudgementStats()}
      {renderCombinedTable()} 
    </div>
  );
}
