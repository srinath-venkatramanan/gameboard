import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams, useNavigate } from "react-router-dom";

export default function JudgementView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState(null);

  useEffect(() => {
    const fetchTable = async () => {
      const { data, error } = await supabase
        .from("score_tables")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setTable(data);
    };
    fetchTable();
  }, [id]);

  const deleteTable = async () => {
    if (!window.confirm("Delete this table?")) return;
    const { error } = await supabase.from("score_tables").delete().eq("id", id);
    if (!error) navigate("/judgement");
  };

  if (!table) return <p>Loading...</p>;

  // eslint-disable-next-line no-unused-vars
  const rounds = table.scores.map((row, idx) => ({
    ...row,
    index: idx,
  }));

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{table.name}</h1>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mb-4"
        onClick={deleteTable}
      >
        Delete Table
      </button>
      <div className="overflow-x-auto flex justify-center">
        <table className="table-auto border-collapse border border-gray-400 text-center min-w-max">
          <thead>
            <tr>
              <th className="border border-gray-400 p-2">Round</th>
              {table.players.map((p, idx) => (
                <th key={idx} className="border border-gray-400 p-2">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.scores.map((row, rowIdx) => {
              const round = table.rounds?.[rowIdx] || {};
              return (
                <tr key={rowIdx}>
                  <td className="border border-gray-400 p-2 text-left">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className={`${round?.suit?.color || "text-black"} w-6 inline-block text-center`}>
                          {round?.suit?.symbol || ""}
                        </span>
                        <span className="ml-2">{round?.suit?.name || ""}</span>
                      </div>
                      <span className="text-xs text-gray-500">{round?.cards} cards play</span>
                    </div>
                  </td>
                  {row.map((cell, colIdx) => (
                    <td key={colIdx} className="border border-gray-400 p-2">{cell}</td>
                  ))}
                </tr>
              );
            })}
            <tr className="font-bold bg-gray-200">
              <td className="border border-gray-400 p-2">Score</td>
              {table.totals.map((t, idx) => (
                <td key={idx} className="border border-gray-400 p-2">{t}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
