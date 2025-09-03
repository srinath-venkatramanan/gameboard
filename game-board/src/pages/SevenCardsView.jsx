// src/pages/SevenCardsView.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

export default function SevenCardsView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const fetchTable = async () => {
      setLoading(true);
      setErrMsg("");

      // handle numeric or uuid ids
      const key = Number.isNaN(Number(id)) ? id : Number(id);

      const { data, error } = await supabase
        .from("score_tables")
        .select("*")
        .eq("id", key)
        .eq("game", "SevenCards")
        .single();

      if (error) {
        console.error(error);
        setErrMsg(error.message || "Failed to load table.");
        setTable(null);
      } else {
        setTable(data);
      }

      setLoading(false);
    };

    fetchTable();
  }, [id]);

  const handleDelete = async () => {
    if (!table) return;
    if (!window.confirm(`Delete table "${table.name}"? This cannot be undone.`)) return;

    const { error } = await supabase.from("score_tables").delete().eq("id", table.id);
    if (error) {
      alert("Failed to delete: " + error.message);
    } else {
      alert("Table deleted.");
      navigate("/sevencards");
    }
  };

  if (loading) {
    return <p className="text-center mt-6">Loading table…</p>;
  }

  if (errMsg || !table) {
    return (
      <div className="flex flex-col items-center mt-6 gap-3">
        <p className="text-red-600">Could not load table. {errMsg && `(${errMsg})`}</p>
        <button
          onClick={() => navigate("/sevencards")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back
        </button>
      </div>
    );
  }

  // Safe fallbacks
  const rounds = Array.isArray(table.rounds) ? table.rounds : [];
  const players = Array.isArray(table.players) ? table.players : [];
  const scores = Array.isArray(table.scores) ? table.scores : [];
  const totals =
    Array.isArray(table.totals) && table.totals.length === players.length
      ? table.totals
      : players.map((_, col) =>
          scores.reduce((sum, row) => sum + (parseInt(row?.[col]) || 0), 0)
        );

  return (
    <div className="flex justify-center p-4">
      <div className="w-full max-w-7xl">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {table.name} — Seven Cards (View)
        </h1>

        {/* Scores Table */}
        <div className="overflow-x-auto flex justify-center mb-6">
          <table className="table-auto border-collapse border border-gray-400 text-center min-w-max">
            <thead>
              <tr>
                <th className="border border-gray-400 p-2">Game</th>
                {players.map((p, idx) => (
                  <th key={idx} className="border border-gray-400 p-2">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rounds.map((round, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="border border-gray-400 p-2">{round}</td>
                  {players.map((_, colIdx) => {
                    const val = scores[rowIdx]?.[colIdx] ?? "";
                    const valStr = String(val);
                    const colorClass =
                      valStr === "0" ? "bg-green-200" : valStr === "65" ? "bg-red-200" : "";
                    return (
                      <td key={colIdx} className={`border border-gray-400 p-2 ${colorClass}`}>
                        {valStr}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="font-bold bg-gray-200">
                <td className="border border-gray-400 p-2">Score</td>
                {totals.map((t, i) => (
                  <td key={i} className="border border-gray-400 p-2 text-center">
                    {t}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/sevencards")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Table
          </button>
        </div>
      </div>
    </div>
  );
}
