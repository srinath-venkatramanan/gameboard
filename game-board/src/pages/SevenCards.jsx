import React, { useState } from "react";
import axios from "axios";
import "../index.css";

function SevenCards() {
  const players = ["Sowmiya", "Srinath", "Vidhya", "Vijay", "Vishwa"];
  const games = Array.from({ length: 15 }, (_, i) => `Game ${i + 1}`);

  const [tableName, setTableName] = useState(""); // Table name
  const [scores, setScores] = useState(
    Array.from({ length: games.length }, () => Array(players.length).fill(""))
  );

  const handleChange = (gameIndex, playerIndex, value) => {
    const newScores = scores.map((row, r) =>
      row.map((cell, c) =>
        r === gameIndex && c === playerIndex ? value : cell
      )
    );
    setScores(newScores);
  };

  // Column totals (per player)
  const columnTotals = players.map((_, playerIndex) =>
    scores.reduce(
      (sum, row) => sum + (parseFloat(row[playerIndex]) || 0),
      0
    )
  );

  // Highlight rule
  const getCellColor = (value) => {
    const num = parseFloat(value);
    if (num === 65) return "bg-red-300";
    if (num === 0) return "bg-green-300";
    return "";
  };

  // Save to backend
  const saveTable = async () => {
    try {
      const payload = {
        name: tableName,
        players,
        scores,
        totals: columnTotals,
      };
      await axios.post("http://localhost:8080/api/tables", payload);
      alert("Table saved successfully!");
    } catch (error) {
      console.error("Error saving table:", error);
      alert("Failed to save table.");
    }
  };

  return (
    <div className="p-2 sm:p-4 overflow-x-auto">
      {/* Table name input */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Enter table name..."
          className="border p-2 rounded w-1/2"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
        />
        <button
          onClick={saveTable}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save Table
        </button>
      </div>

      {/* Score Table */}
      <table className="min-w-full border-collapse border border-gray-400 text-center text-xs sm:text-sm md:text-base">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-400 px-1 sm:px-2 py-1">Game</th>
            {players.map((player, index) => (
              <th
                key={index}
                className="border border-gray-400 px-1 sm:px-2 py-1 whitespace-nowrap"
              >
                {player}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {games.map((game, gameIndex) => (
            <tr key={gameIndex}>
              <td className="border border-gray-400 px-1 sm:px-2 py-1 whitespace-nowrap">
                {game}
              </td>
              {players.map((_, playerIndex) => (
                <td
                  key={playerIndex}
                  className={`border border-gray-400 px-1 sm:px-2 py-1 ${getCellColor(
                    scores[gameIndex][playerIndex]
                  )}`}
                >
                  <textarea
                    className="w-full h-8 sm:h-10 resize-none border rounded p-1 text-center text-xs sm:text-sm bg-transparent"
                    value={scores[gameIndex][playerIndex]}
                    onChange={(e) =>
                      handleChange(gameIndex, playerIndex, e.target.value)
                    }
                  />
                </td>
              ))}
            </tr>
          ))}

          {/* Final Scores row */}
          <tr className="bg-gray-200 font-bold">
            <td className="border border-gray-400 px-1 sm:px-2 py-1">Score</td>
            {columnTotals.map((total, index) => (
              <td
                key={index}
                className="border border-gray-400 px-1 sm:px-2 py-1"
              >
                {total}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default SevenCards;
