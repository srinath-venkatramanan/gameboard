import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Judgement() {
  const defaultPlayers = ["Sowmiya", "Srinath", "Vidhya", "Vijay", "Vishwa"];
  const navigate = useNavigate();

  const shapes = [
    { name: "Spades", symbol: "♠", color: "text-black" },
    { name: "Diamonds", symbol: "♦", color: "text-red-500" },
    { name: "Clubs", symbol: "♣", color: "text-black" },
    { name: "Hearts", symbol: "♥", color: "text-red-500" },
    { name: "Numbers", symbol: "🔢", color: "text-blue-500" },
  ];

  const rounds = [
    { suit: shapes[0], cards: 10 },
    { suit: shapes[1], cards: 9 },
    { suit: shapes[2], cards: 8 },
    { suit: shapes[3], cards: 7 },
    { suit: shapes[4], cards: 6 },
    { suit: shapes[0], cards: 5 },
    { suit: shapes[1], cards: 4 },
    { suit: shapes[2], cards: 3 },
    { suit: shapes[3], cards: 2 },
    { suit: shapes[4], cards: 1 },
    { suit: shapes[4], cards: 10 },
    { suit: shapes[3], cards: 9 },
    { suit: shapes[2], cards: 8 },
    { suit: shapes[1], cards: 7 },
    { suit: shapes[0], cards: 6 },
    { suit: shapes[4], cards: 5 },
    { suit: shapes[3], cards: 4 },
    { suit: shapes[2], cards: 3 },
    { suit: shapes[1], cards: 2 },
    { suit: shapes[0], cards: 1 },
  ];

  const [tableName, setTableName] = useState("");
  const [players, setPlayers] = useState(defaultPlayers);
  const [scores, setScores] = useState(
    Array.from({ length: rounds.length }, () =>
      Array(defaultPlayers.length).fill("")
    )
  );
  const [previousTables, setPreviousTables] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [tableId, setTableId] = useState(null);

  const isTableLocked = scores.some((row) => row.some((cell) => cell !== ""));

  useEffect(() => {
    const fetchTables = async () => {
      const { data, error } = await supabase
        .from("score_tables")
        .select("*")
        .eq("game", "Judgement")
        .order("created_at", { ascending: false });
      if (!error) setPreviousTables(data);
    };
    fetchTables();
  }, []);

  const handleChange = async (row, col, value) => {
    const newScores = scores.map((r, ri) =>
      r.map((c, ci) => (ri === row && ci === col ? value : c))
    );
    setScores(newScores);

    if (value.trim() !== "") {
      await saveTable(newScores);
    }
  };

  const getPlayerTotal = (col) =>
    scores.reduce((sum, row) => sum + (parseInt(row[col]) || 0), 0);

  const saveTable = async (updatedScores) => {
    if (!tableName.trim()) return;

    if (tableId) {
      const { error } = await supabase
        .from("score_tables")
        .update({
          players,
          scores: updatedScores,
          totals: players.map((_, i) => getPlayerTotal(i)),
        })
        .eq("id", tableId);
      if (error) alert("Failed to update table: " + error.message);
    } else {
      const { data, error } = await supabase
        .from("score_tables")
        .insert([
          {
            name: tableName,
            game: "Judgement",
            players,
            scores: updatedScores,
            totals: players.map((_, i) => getPlayerTotal(i)),
            rounds,
          },
        ])
        .select();
      if (error) alert("Failed to save table: " + error.message);
      else if (data && data[0]) setTableId(data[0].id);
    }

    const { data } = await supabase
      .from("score_tables")
      .select("*")
      .eq("game", "Judgement")
      .order("created_at", { ascending: false });
    if (data) setPreviousTables(data);
  };

  const maxNameLength = Math.max(...players.map((p) => p.length));
  const inputWidth = Math.max(maxNameLength * 12, 60);

  const totalPages = Math.ceil(previousTables.length / itemsPerPage);
  const paginatedTables = previousTables.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        <h2 className="text-2xl font-bold mb-4 text-center">Judgement Game</h2>

        {/* Table Name */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-center">
          <input
            type="text"
            placeholder="Enter table name"
            className="border p-2 rounded w-full sm:w-1/2"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            disabled={isTableLocked}
          />
        </div>

        {/* Players */}
        <div className="mb-4 flex flex-wrap gap-2 items-center justify-center">
          {players.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded"
            >
              <span>{p}</span>
              <button
                onClick={() => {
                  if (!isTableLocked && players.length > 1) {
                    setPlayers(players.filter((_, i) => i !== idx));
                    setScores(scores.map((row) => row.filter((_, i) => i !== idx)));
                  }
                }}
                className={`text-red-600 font-bold px-1 rounded hover:bg-red-100 ${
                  isTableLocked ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                x
              </button>
            </div>
          ))}

          <input
            type="text"
            placeholder="New player name"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            className="border p-1 rounded"
            disabled={isTableLocked} // <-- disable after first score
          />
          <button
            onClick={() => {
              if (newPlayerName.trim()) {
                setPlayers([...players, newPlayerName.trim()]);
                setScores(scores.map((row) => [...row, ""]));
                setNewPlayerName("");
              }
            }}
            className="bg-blue-500 text-black px-2 py-1 rounded hover:bg-blue-600"
            disabled={isTableLocked} // <-- disable after first score
          >
            Add Player
          </button>
        </div>

        {/* Editable Table */}
        <div className="overflow-x-auto flex justify-center mb-6">
          <table className="table-auto border-collapse border border-gray-400 text-center min-w-max">
            <thead>
              <tr>
                <th className="border border-gray-400 p-2">Rounds/Players</th>
                {players.map((p, idx) => (
                  <th key={idx} className="border border-gray-400 p-2">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rounds.map((r, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="border border-gray-400 p-2 text-left">
                    <div className="flex flex-col items-center">
                      <div className="flex flex-col border rounded overflow-hidden w-40">
                        <div className="flex">
                          <div
                            style={{ width: "30%" }}
                            className="bg-white text-center p-2 border-r border-gray-300"
                          >
                            <span
                              className={`${r.suit.color} text-2xl leading-none`}
                            >
                              {r.suit.symbol}
                            </span>
                          </div>
                          <div
                            style={{ width: "70%" }}
                            className="bg-gray-200 text-center p-2 text-sm font-medium"
                          >
                            {r.suit.name}
                          </div>
                        </div>
                        <div className="bg-gray-50 text-center text-xs text-gray-500 p-1">
                          {r.cards} cards play
                        </div>
                      </div>
                    </div>
                  </td>
                  {players.map((_, colIdx) => (
                    <td key={colIdx} className="border border-gray-400 p-1">
                      <input
                        type="number"
                        value={scores[rowIdx][colIdx]}
                        onChange={(e) =>
                          handleChange(rowIdx, colIdx, e.target.value)
                        }
                        className="p-1 text-center border rounded"
                        style={{ width: inputWidth }}
                        disabled={!tableName.trim()} // <-- disable until table name
                      />
                    </td>
                  ))}
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

        {/* Previous Tables */}
        <div>
          <h2 className="text-lg font-bold mb-2 text-center">Previous Games</h2>
          {previousTables.length === 0 && (
            <p className="text-center">No previous games found</p>
          )}
          <ul className="flex flex-col items-center">
            {paginatedTables.map((t) => (
              <li
                key={t.id}
                className="cursor-pointer p-2 mb-2 bg-white rounded shadow hover:bg-gray-100 w-1/2 text-center"
                onClick={() => navigate(`/judgement/view/${t.id}`)}
              >
                {t.name}
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-2 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
