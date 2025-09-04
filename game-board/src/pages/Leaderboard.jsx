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

      const totalSevenGames = sevenData?.length || 0;
      const totalJudgementGames = judData?.length || 0;

      const sevenPlayers = new Set();
      sevenData?.forEach((t) => t.players.forEach((p) => sevenPlayers.add(p)));

      const judPlayers = new Set();
      judData?.forEach((t) => t.players.forEach((p) => judPlayers.add(p)));

      const totalPlayers = new Set([...sevenPlayers, ...judPlayers]).size;

      setSummary({
        totalSevenGames,
        totalJudgementGames,
        totalPlayers,
      });

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
            .sort((a, b) => a.score - b.score); // lowest is winner

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

        // Consistency: lower total, more 0s, more 65/130
        // eslint-disable-next-line no-unused-vars
        const consistencyScores = players.map((p, idx) => {
          const stats = playerStats[p];
          return {
            player: p,
            score: stats.zeros * 4 + stats.maxScore65Or130 * 2,
          };
        });
        const mostConsistentScore = Math.max(...consistencyScores.map((c) => c.score));
        const mostConsistent = consistencyScores
          .filter((c) => c.score === mostConsistentScore)
          .map((c) => c.player)
          .join(", ");

        setSevenStats({ playerStats, mostConsistent });
      }

      // --- Judgement Stats ---
      if (judData && judData.length > 0) {
        const players = judData[0].players;
        const playerStats = players.reduce((acc, p) => {
          acc[p] = { firstWins: 0, secondWins: 0, lastPlace: 0 };
          return acc;
        }, {});

        judData.forEach((table) => {
          const totals = table.totals;
          const sorted = totals
            .map((score, idx) => ({ player: players[idx], score }))
            .sort((a, b) => b.score - a.score); // highest is winner

          playerStats[sorted[0].player].firstWins++;
          if (sorted[1]) playerStats[sorted[1].player].secondWins++;
          playerStats[sorted[sorted.length - 1].player].lastPlace++;
        });

        // Consistency: total positive scores + weight for non-divisible by 10
        const consistencyScores = players.map((p, idx) => {
          const totals = judData.map((t) => t.totals[idx]);
          const score = totals.reduce(
            (acc, t) => acc + (t > 0 ? t : 0) + (t % 10 !== 0 ? 5 : 0),
            0
          );
          return { player: p, score };
        });

        const mostConsistentScore = Math.max(...consistencyScores.map((c) => c.score));
        const mostConsistent = consistencyScores
          .filter((c) => c.score === mostConsistentScore)
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

    const mostFirst = Object.entries(stats).sort((a, b) => b[1].firstWins - a[1].firstWins)[0];
    const mostSecond = Object.entries(stats).sort((a, b) => b[1].secondWins - a[1].secondWins)[0];
    const mostDefeats = Object.entries(stats).sort((a, b) => b[1].defeats - a[1].defeats)[0];
    const mostZeros = Object.entries(stats).sort((a, b) => b[1].zeros - a[1].zeros)[0];
    const most65Or130 = Object.entries(stats).sort(
      (a, b) => b[1].maxScore65Or130 - a[1].maxScore65Or130
    )[0];

    return (
      <div className="mb-12 w-full max-w-6xl">
        <h2 className="text-xl font-bold mb-4">Seven Cards Statistics 7️⃣</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Winning 1st</h3>
            <p>{mostFirst[0]} ({mostFirst[1].firstWins} wins)</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Winning 2nd</h3>
            <p>{mostSecond[0]} ({mostSecond[1].secondWins} wins)</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Consistent Player</h3>
            <p>{sevenStats.mostConsistent}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Defeats</h3>
            <p>{mostDefeats[0]} ({mostDefeats[1].defeats} losses)</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Maximum 0's Score</h3>
            <p>{mostZeros[0]} ({mostZeros[1].zeros} zeros)</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Maximum 65 / 130 Score</h3>
            <p>{most65Or130[0]} ({most65Or130[1].maxScore65Or130})</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">Player</th>
                <th className="px-4 py-2">1st Place</th>
                <th className="px-4 py-2">2nd Place</th>
                <th className="px-4 py-2">Last Place</th>
                <th className="px-4 py-2">0s</th>
                <th className="px-4 py-2">65/130</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats).map(([player, s]) => (
                <tr key={player} className="text-center border-b">
                  <td className="px-4 py-2">{player}</td>
                  <td className="px-4 py-2">{s.firstWins}</td>
                  <td className="px-4 py-2">{s.secondWins}</td>
                  <td className="px-4 py-2">{s.defeats}</td>
                  <td className="px-4 py-2">{s.zeros}</td>
                  <td className="px-4 py-2">{s.maxScore65Or130}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderJudgementStats = () => {
    if (!judgementStats) return <p>Loading...</p>;
    const stats = judgementStats.playerStats;

    const mostFirst = Object.entries(stats).sort((a, b) => b[1].firstWins - a[1].firstWins)[0];
    const mostSecond = Object.entries(stats).sort((a, b) => b[1].secondWins - a[1].secondWins)[0];
    const mostLast = Object.entries(stats).sort((a, b) => b[1].lastPlace - a[1].lastPlace)[0];

    return (
      <div className="mb-12 w-full max-w-6xl">
        <h2 className="text-xl font-bold mb-4">Judgement Statistics 🃏</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Winning 1st</h3>
            <p>{mostFirst[0]} ({mostFirst[1].firstWins} wins)</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Winning 2nd</h3>
            <p>{mostSecond[0]} ({mostSecond[1].secondWins} wins)</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Consistent Player</h3>
            <p>{judgementStats.mostConsistent}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Most Last Place</h3>
            <p>{mostLast[0]} ({mostLast[1].lastPlace} times)</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">Player</th>
                <th className="px-4 py-2">1st Place</th>
                <th className="px-4 py-2">2nd Place</th>
                <th className="px-4 py-2">Last Place</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats).map(([player, s]) => (
                <tr key={player} className="text-center border-b">
                  <td className="px-4 py-2">{player}</td>
                  <td className="px-4 py-2">{s.firstWins}</td>
                  <td className="px-4 py-2">{s.secondWins}</td>
                  <td className="px-4 py-2">{s.lastPlace}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <button
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded shadow"
        onClick={() => navigate("/")}
      >
        Home
      </button>

      {summary && (
        <div className="mb-8 text-lg font-semibold">
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
