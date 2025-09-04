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
          acc[p] = {
            firstWins: 0,
            secondWins: 0,
            defeats: 0,
            zeros: 0,
            maxScore65Or130: 0,
            total: 0,
          };
          return acc;
        }, {});

        sevenData.forEach((table) => {
          const totals = table.totals;
          const sorted = totals
            .map((score, idx) => ({ player: players[idx], score }))
            .sort((a, b) => a.score - b.score);

          // 1st & 2nd
          playerStats[sorted[0].player].firstWins++;
          if (sorted[1]) playerStats[sorted[1].player].secondWins++;

          // Defeat = last
          playerStats[sorted[sorted.length - 1].player].defeats++;

          // Per-round scoring
          table.scores.forEach((row) => {
            row.forEach((val, idx) => {
              const score = parseInt(val) || 0;
              playerStats[players[idx]].total += score;
              if (score === 0) playerStats[players[idx]].zeros++;
              if (score === 65 || score === 130) playerStats[players[idx]].maxScore65Or130++;
            });
          });
        });

        // Consistency scoring system
        const consistency = Object.entries(playerStats).map(([player, st]) => {
          const score = -st.total + st.zeros * 5 + st.maxScore65Or130 * 2;
          return { player, score };
        });
        const maxScore = Math.max(...consistency.map((c) => c.score));
        const mostConsistent = consistency
          .filter((c) => c.score === maxScore)
          .map((c) => c.player);

        setSevenStats({ playerStats, mostConsistent });
      }

      // --- Judgement Stats ---
      if (judData && judData.length > 0) {
        const players = judData[0].players;
        const playerStats = players.reduce((acc, p) => {
          acc[p] = { firstWins: 0, secondWins: 0, totals: [] };
          return acc;
        }, {});

        judData.forEach((table) => {
          const totals = table.totals;
          const sorted = totals
            .map((score, idx) => ({ player: players[idx], score }))
            .sort((a, b) => b.score - a.score);

          playerStats[sorted[0].player].firstWins++;
          if (sorted[1]) playerStats[sorted[1].player].secondWins++;

          totals.forEach((val, idx) => {
            playerStats[players[idx]].totals.push(val);
          });
        });

        // Consistency scoring
        const consistency = Object.entries(playerStats).map(([player, st]) => {
          const avg =
            st.totals.reduce((a, b) => a + b, 0) / (st.totals.length || 1);
          const bonus = st.totals.filter((s) => s % 2 === 0 || s % 3 === 0 || s % 5 === 0).length;
          return { player, score: avg + bonus };
        });
        const maxScore = Math.max(...consistency.map((c) => c.score));
        const mostConsistent = consistency
          .filter((c) => c.score === maxScore)
          .map((c) => c.player);

        setJudgementStats({ playerStats, mostConsistent });
      }
    };

    fetchStats();
  }, []);

  // --- Helpers ---
  const getMaxPlayers = (stats, key) => {
    const maxVal = Math.max(...Object.values(stats).map((s) => s[key]));
    return Object.entries(stats)
      .filter(([_, s]) => s[key] === maxVal && maxVal > 0)
      .map(([p, s]) => `${p} (${s[key]})`);
  };

  const renderSevenStats = () => {
    if (!sevenStats) return <p>Loading...</p>;
    const stats = sevenStats.playerStats;

    return (
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Seven Cards Statistics 7️⃣</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Most Winning 1st" values={getMaxPlayers(stats, "firstWins")} />
          <StatCard title="Most Winning 2nd" values={getMaxPlayers(stats, "secondWins")} />
          <StatCard title="Most Consistent Player" values={sevenStats.mostConsistent} />
          <StatCard title="Most Defeats" values={getMaxPlayers(stats, "defeats")} />
          <StatCard title="Maximum 0's Score" values={getMaxPlayers(stats, "zeros")} />
          <StatCard title="Maximum 65 / 130 Score" values={getMaxPlayers(stats, "maxScore65Or130")} />
        </div>
      </div>
    );
  };

  const renderJudgementStats = () => {
    if (!judgementStats) return <p>Loading...</p>;
    const stats = judgementStats.playerStats;

    return (
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Judgement Statistics 🎯</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Most Winning 1st" values={getMaxPlayers(stats, "firstWins")} />
          <StatCard title="Most Winning 2nd" values={getMaxPlayers(stats, "secondWins")} />
          <StatCard title="Most Consistent Player" values={judgementStats.mostConsistent} />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Leaderboard 🏆</h1>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 w-full max-w-5xl">
          <SummaryCard title="Total Seven Cards Games" value={summary.totalSevenGames} />
          <SummaryCard title="Total Judgement Games" value={summary.totalJudgementGames} />
          <SummaryCard title="Total Players" value={summary.totalPlayers} />
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

// --- Reusable UI Components ---
const StatCard = ({ title, values }) => (
  <div className="bg-white p-4 rounded shadow">
    <h3 className="font-semibold mb-2">{title}</h3>
    {Array.isArray(values) ? (
      values.length > 0 ? (
        values.map((v, i) => <p key={i}>{v}</p>)
      ) : (
        <p>—</p>
      )
    ) : (
      <p>{values}</p>
    )}
  </div>
);

const SummaryCard = ({ title, value }) => (
  <div className="bg-white p-4 rounded shadow text-center">
    <h3 className="font-semibold mb-2">{title}</h3>
    <p>{value}</p>
  </div>
);
