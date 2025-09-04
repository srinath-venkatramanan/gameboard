import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, useParams } from "react-router-dom";

export default function SevenCardsView() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [tableName, setTableName] = useState("");
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState([]);
  const [rounds, setRounds] = useState([]);

  useEffect(() => {
    const fetchTable = async () => {
      const { data, error } = await supabase
        .from("score_tables")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        setTableName(data.name || "");
        setPlayers(data.players || []);
        setScores(data.scores || []);
        setRounds(data.rounds || []);
      }
    };
    fetchTable();
  }, [id]);

  const getPlayerTotal = (col) =>
    scores.reduce((sum, row) => sum + (parseInt(row[col]) || 0), 0);

  const handleEdit = () => navigate(`/sevencards/edit/${id}`);
  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this game?");
    if (confirmed) {
      const { error } = await supabase.from("score_tables").delete().eq("id", id);
      if (error) alert("Delete failed: " + error.message);
      else navigate("/sevencards");
    }
  };

  return (
    <div className="flex justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-500 text-black px-3 py-1 rounded hover:bg-blue-600"
        >
          Home
        </button>
      </div>

      <div className="w-full max-w-7xl">
        <h2 className="text-2xl font-bold mb-4 text-center">Seven Cards Game</h2>

        {/* Table Name (empty placeholder) */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-center">
          <input
            type="text"
            placeholder=""
            className="border p-2 rounded w-full sm:w-1/2"
            value={tableName}
            disabled
          />
        </div>

        {/* Action Buttons */}
        <div className="mb-4 flex flex-wrap gap-2 items-center justify-center">
          <button
            onClick={handleEdit}
            className="bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-600"
          >
            Edit Game
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-black px-3 py-1 rounded hover:bg-red-600"
          >
            Delete Game
          </button>
        </div>

        {/* Scores Table */}
        <div className="overflow-x-auto flex justify-center mb-6">
          <table className="table-auto border-collapse border border-gray-400 text-center min-w-max">
            <thead>
              <tr>
                <th className="border border-gray-400 p-2">Games/Players</th>
                {players.map((p, idx) => (
                  <th key={idx} className="border border-gray-400 p-2">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rounds.map((round, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="border border-gray-400 p-2">{round}</td>
                  {players.map((_, colIdx) => {
                    const val = scores[rowIdx][colIdx];
                    return (
                      <td
                        key={colIdx}
                        className={`border border-gray-400 p-1 ${
                          val === "0"
                            ? "bg-green-200"
                            : val === "65"
                            ? "bg-red-200"
                            : val === "130"
                            ? "bg-red-200"
                            : ""
                        }`}
                      >
                        <input
                          type="number"
                          value={val}
                          className="p-1 text-center border rounded w-24 bg-gray-100 cursor-not-allowed"
                          disabled
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="font-bold bg-gray-200">
                <td className="border border-gray-400 p-2">Score</td>
                {players.map((_, i) => (
                  <td key={i} className="border border-gray-400 p-2 text-center">
                    {getPlayerTotal(i)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
