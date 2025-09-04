// src/pages/Leaderboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Leaderboard() {
  const navigate = useNavigate();
  const [sevenStats, setSevenStats] = useState(null);
  const [judgementStats, setJudgementStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [sevenDataState, setSevenDataState] = useState([]);
  const [judDataState, setJudDataState] = useState([]);

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

      setSevenDataState(sevenData || []);
      setJudDataState(judData || []);

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
            .sort((a, b) => a.score - b.score); // lower points win

          if (sorted[0]) playerStats[sorted[0].player].firstWins++;
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

        // Calculate consistency score
        const consistency = players.map((p, idx) => {
          const stats = playerStats[p];
          // Weight: zeros *4 + maxScore65Or130*2 + low total avg
          const score = stats.zeros * 4 + stats.maxScore65Or130 * 2;
          return { player: p, score };
        });

        const maxConsScore = Math.max(...consistency.map((c) => c.score));
        const mostConsistent = consistency.filter((c) => c.score === maxConsScore).map((c) => c.player).join(", ");

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
            .sort((a, b) => b.score - a.score); // higher points win

          if (sorted[0]) playerStats[sorted[0].player].firstWins++;
          if (sorted[1]) playerStats[sorted[1].player].secondWins++;
        });

        // Consistency based on positive scores & non-divisible by 10
        const consistency = players.map((p, idx) => {
          const allScores = judData.flatMap((table) => table.scores.map((row) => parseInt(row[idx] || 0)));
          const positive = allScores.filter((s) => s > 0).length;
          const nonDiv10 = allScores.filter((s) => s % 10 !== 0 && s > 0).length;
          return { player: p, score: positive + nonDiv10 };
        });

        const maxConsScore = Math.max(...consistency.map((c) => c.score));
        const mostConsistent = consistency.filter((c) => c.score === maxConsScore).map((c) => c.player).join(", ");

        setJudgementStats({ playerStats, mostConsistent });
      }
    };

    fetchStats();
  }, []);

  // --- Render Combined Table ---
  const renderCombinedTable = () => {
    if (!sevenStats || !judgementStats) return null;
    const players = Object.keys(sevenStats.playerStats);

    return (
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full bg-white border border-gray-300 rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-center">
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
              const judLast = judDataState ? judDataState.length - jud.firstWins - jud.secondWins : 0;

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

  // --- Render Seven Cards Stats ---
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
        <ul className="list-disc pl-6">
          <li>Most Winning 1st: {mostFirst[0]} ({mostFirst[1].firstWins} wins)</li>
          <li>Most Winning 2nd: {mostSecond[0]} ({mostSecond[1].secondWins} wins)</li>
          <li>Most Consistent Player: {sevenStats.mostConsistent}</li>
          <li>Most Defeats: {mostDefeats[0]} ({mostDefeats[1].defeats} losses)</li>
          <li>Maximum 0's Score: {mostZeros[0]} ({mostZeros[1].zeros} zeros)</li>
          <li>Maximum 65 / 130 Score: {most65Or130[0]} ({most65Or130[1].maxScore65Or130})</li>
        </ul>
      </div>
    );
  };

  // --- Render Judgement Stats ---
  const renderJudgementStats = () => {
    if (!judgementStats) return null;
    const stats = judgementStats.playerStats;

    const mostFirst = Object.entries(stats).sort((a, b) => b[1].firstWins - a[1].firstWins)[0];
    const mostSecond = Object.entries(stats).sort((a, b) => b[1].secondWins - a[1].secondWins)[0];

    return (
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Judgement Statistics 🃏</h2>
        <ul className="list-disc pl-6">
          <li>Most Winning 1st: {mostFirst[0]} ({mostFirst[1].firstWins} wins)</li>
          <li>Most Winning 2nd: {mostSecond[0]} ({mostSecond[1].secondWins} wins)</li>
          <li>Most Consistent Player: {judgementStats.mostConsistent}</li>
        </ul>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Leaderboard 📊</h1>

      {summary && (
        <div className="mb-4">
          <p>Total Seven Cards Games: {summary.totalSevenGames}</p>
          <p>Total Judgement Games: {summary.totalJudgementGames}</p>
          <p>Total Players: {summary.totalPlayers}</p>
        </div>
      )}

      {renderCombinedTable()}

      {renderSevenStats()}
      {renderJudgementStats()}

      <button
        className="mt-6 px-4 py-2 bg-blue-500 text-black rounded shadow"
        onClick={() => navigate("/")}
      >
        Home
      </button>
    </div>
  );
}