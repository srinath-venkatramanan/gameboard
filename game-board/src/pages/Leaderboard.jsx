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
            .sort((a, b) => a.score - b.score);

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

        const consistency = players.map((p, idx) => {
          const playerTotals = sevenData.map((t) => t.totals[idx]);
          const avg = playerTotals.reduce((a, b) => a + b, 0) / playerTotals.length;
          const variance =
            playerTotals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / playerTotals.length;
          return { player: p, std: Math.sqrt(variance) };
        });
        const mostConsistent = consistency.sort((a, b) => a.std - b.std)[0].player;

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
            .sort((a, b) => b.score - a.score);

          playerStats[sorted[0].player].firstWins++;
          if (sorted[1]) playerStats[sorted[1].player].secondWins++;
        });

        const consistency = players.map((p, idx) => {
          const playerTotals = judData.map((t) => t.totals[idx]);
          const avg = playerTotals.reduce((a, b) => a + b, 0) / playerTotals.length;
          const variance =
            playerTotals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / playerTotals.length;
          return { player: p, std: Math.sqrt(variance) };
        });
        const mostConsistent = consistency.sort((a, b) => a.std - b.std)[0].player;

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
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Seven Cards Statistics 7️⃣</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>
    );
  };

  const renderJudgementStats = () => {
    if (!judgementStats) return <p>Loading...</p>;

    const stats = judgementStats.playerStats;
    const mostFirst = Object.entries(stats).sort((a, b) => b[1].firstWins - a[1].firstWins)[0];
    const mostSecond = Object.entries(stats).sort((a, b) => b[1].secondWins - a[1].secondWins)[0];

    return (
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Judgement Statistics 🎯</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Leaderboard 🏆</h1>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 w-full max-w-5xl">
          <div className="bg-white p-4 rounded shadow text-center">
            <h3 className="font-semibold mb-2">Total Seven Cards Games</h3>
            <p>{summary.totalSevenGames}</p>
          </div>
          <div className="bg-white p-4 rounded shadow text-center">
            <h3 className="font-semibold mb-2">Total Judgement Games</h3>
            <p>{summary.totalJudgementGames}</p>
          </div>
          <div className="bg-white p-4 rounded shadow text-center">
            <h3 className="font-semibold mb-2">Total Players</h3>
            <p>{summary.totalPlayers}</p>
          </div>
        </div>
      )}

      {renderSevenStats()}
      {renderJudgementStats()}

      <div className="flex justify-center mt-8">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-500 text-black px-6 py-3 rounded hover:bg-blue-600"
        >
          Home
        </button>
      </div>
    </div>
  );
}
